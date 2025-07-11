import {
//   Filter,
//   RotateCcw,
  ChevronDown,
  ChevronUp,
  Download,
  Upload,
  Trash2,
  Calendar,
} from "lucide-react";
import PaginationFooter from "../../ui/PaginationFooter";
import { exportToExcel } from "../../ui/exportToExcel";
// import Button from "../../ui/Button";
import { useMemo, useState } from "react";
import { Draggable } from "../../common/Draggable";
import { Droppable } from "../../common/Droppable";
import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import React from "react";
// import LoadingSpinner from "../../ui/LoadingSpinner";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getPaginationRowModel,
  type ColumnDef,
} from "@tanstack/react-table";
import ExpandedRow from "../../common/RenderExpandedCell";
// import axios from "axios";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css"; // main style file
import "react-date-range/dist/theme/default.css"; // theme css file

const roleFieldLabels: Record<keyof ExposureBucketing, string> = {
  poNumber: "PO Number",
  client: "Client",
  type: "Type",
  bu: "Business Unit",
  details: "Details",
  date: "Date",
  currency: "Currency",
  amount: "Amount",
  advance: "Advance",
  inco: "INCO Terms",
  month1: "Month 1",
  month2: "Month 2",
  month3: "Month 3",
  month4to6: "Month 4 to 6",
  monthMoreThan6: "Month > 6",
  remarks: "Remarks",
};

const ExposureBucketingTable: React.FC = () => {
  const [columnOrder, setColumnOrder] = useState<string[]>([]);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [editStates, setEditStates] = useState<
    Record<string, Partial<ExposureBucketing>>
  >({});
  const [searchTerm, setSearchTerm] = useState("");
  const [editingRows, setEditingRows] = useState<Set<string>>(new Set());
  const [showSelected, setShowSelected] = useState<boolean>(true);
  const [data, setData] = useState<ExposureBucketing[]>([]);
//   const [loading, setLoading] = useState(true);
  const [originalData, setOriginalData] = useState<ExposureBucketing[]>([]); // Store original unfiltered data
  //   const [actionVisibility, setActionVisibility] = useState({
  //     showCreateButton: false,
  //     showEditButton: false,
  //     showDeleteButton: false,
  //     showApproveButton: false,
  //     showRejectButton: false,
  //   });

  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateRange, setDateRange] = useState([
    {
      startDate: null,
      endDate: null,
      key: "selection",
    },
  ]);

  //   function handleDelete(roleId: number) {
  //     if (!window.confirm("Are you sure you want to delete this role?")) return;

  //     axios
  //       .post(`http://localhost:3143/roles/${roleId}/delete`)
  //       .then((response) => {
  //         const data = response.data;
  //         alert(
  //           `Role delete requested successfully: ${
  //             data.deleted?.name || "Unnamed Role"
  //           }`
  //         );
  //         setData((prevRoles) => prevRoles.filter((role) => role.id !== roleId));
  //         setOriginalData((prevRoles) =>
  //           prevRoles.filter((role) => role.id !== roleId)
  //         );
  //       })
  //       .catch((error) => {
  //         console.error("Delete error:", error);
  //         const message =
  //           error.response?.data?.message ||
  //           error.response?.data?.error ||
  //           "An error occurred while deleting the role.";
  //         alert(`Error: ${message}`);
  //       });
  //   }

  //   useEffect(() => {
  //     axios
  //       .get<BackendResponse>(
  //         `http://localhost:3143/api/roles/page-data?nocache=${Date.now()}`
  //       )
  //       .then(({ data }) => {
  //         if (!data || !data.roleData) {
  //           setLoading(false);
  //           console.error("Invalid payload structure or empty response:", data);
  //           return;
  //         }

  //         const {
  //           showCreateButton,
  //           showEditButton,
  //           showDeleteButton,
  //           showApproveButton,
  //           showRejectButton,
  //           roleData,
  //         } = data;

  //         setActionVisibility({
  //           showCreateButton: !!showCreateButton,
  //           showEditButton: !!showEditButton,
  //           showDeleteButton: !!showDeleteButton,
  //           showApproveButton: !!showApproveButton,
  //           showRejectButton: !!showRejectButton,
  //         });

  //         setData(roleData);
  //         setLoading(false);

  //         setOriginalData(roleData); // Store original data
  //       })
  //       .catch((err) => {
  //         setLoading(false);

  //         console.error("Error fetching roles:", err);
  //       });
  //   }, []);

  const toggleRowExpansion = (rowId: string) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(rowId)) {
        newSet.delete(rowId);
      } else {
        newSet.add(rowId);
      }
      return newSet;
    });
  };

  // Get unique status values for dropdown
  const statusOptions = useMemo(() => {
    const options = new Set<string>();
    originalData.forEach((role) => {
      if (role.status) options.add(role.status);
    });
    return ["all", ...Array.from(options)];
  }, [originalData]);

  const filteredData = useMemo(() => {
    let result = [...originalData];

    // Apply search filter
    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter((user) => {
        return Object.entries(user)
          .flatMap(([key, value]) => {
            if (typeof value === "object" && value !== null) {
              return Object.values(value);
            }
            return value;
          })
          .filter(Boolean)
          .some((field) => String(field).toLowerCase().includes(lowerSearch));
      });
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((role) => role.status === statusFilter);
    }

    // Apply date range filter
    if (dateRange[0].startDate && dateRange[0].endDate) {
      const start = new Date(dateRange[0].startDate);
      const end = new Date(dateRange[0].endDate);

      result = result.filter((role) => {
        if (!role.createdAt) return false;
        const roleDate = new Date(role.createdAt);
        return roleDate >= start && roleDate <= end;
      });
    }

    return result;
  }, [searchTerm, originalData, statusFilter, dateRange]);

    const columns = useMemo<ColumnDef<ExposureBucketing>[]>(() => {
    const baseColumns: ColumnDef<ExposureBucketing>[] = [
      {
        accessorKey: "srNo",
        header: "Sr No",
        cell: ({ row }) => (
          <span className="text-gray-700">{row.index + 1}</span>
        ),
      },
      {
        accessorKey: "poNumber",
        header: "PO Number",
        cell: (info) => (
          <span className="font-medium text-gray-900">
            {info.getValue() as string}
          </span>
        ),
      },
      {
        accessorKey: "client",
        header: "Client",
        cell: (info) => (
          <span className="text-gray-700">{info.getValue() as string}</span>
        ),
      },
      {
        accessorKey: "type",
        header: "Type",
        cell: (info) => (
          <span className="text-gray-700">{info.getValue() as string}</span>
        ),
      },
      {
        accessorKey: "bu",
        header: "BU",
        cell: (info) => (
          <span className="text-gray-700">{info.getValue() as string}</span>
        ),
      },
      {
        accessorKey: "details",
        header: "Details",
        cell: (info) => (
          <span className="text-gray-700">{info.getValue() as string}</span>
        ),
      },
      {
        accessorKey: "date",
        header: "Date",
        cell: (info) => {
          const value = info.getValue() as string;
          const date = new Date(value);
          return (
            <span className="text-gray-700">
              {isNaN(date.getTime()) ? value : date.toLocaleDateString()}
            </span>
          );
        },
      },
      {
        accessorKey: "currency",
        header: "Currency",
        cell: (info) => (
          <span className="text-gray-700">{info.getValue() as string}</span>
        ),
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: (info) => {
          const amount = info.getValue() as number;
          return (
            <span className="font-medium text-gray-900">
              {amount.toLocaleString()}
            </span>
          );
        },
      },
      {
        accessorKey: "advance",
        header: "Advance",
        cell: (info) => {
          const advance = info.getValue() as number;
          return (
            <span className="text-gray-700">{advance.toLocaleString()}</span>
          );
        },
      },
      {
        accessorKey: "inco",
        header: "INCO",
        cell: (info) => (
          <span className="text-gray-700">{info.getValue() as string}</span>
        ),
      },
      {
        accessorKey: "month1",
        header: "Month 1",
        cell: (info) => {
          const value = info.getValue() as number;
          return (
            <span className="text-gray-700">{value.toLocaleString()}</span>
          );
        },
      },
      {
        accessorKey: "month2",
        header: "Month 2",
        cell: (info) => {
          const value = info.getValue() as number;
          return (
            <span className="text-gray-700">{value.toLocaleString()}</span>
          );
        },
      },
      {
        accessorKey: "month3",
        header: "Month 3",
        cell: (info) => {
          const value = info.getValue() as number;
          return (
            <span className="text-gray-700">{value.toLocaleString()}</span>
          );
        },
      },
      {
        accessorKey: "month4to6",
        header: "Month 4-6",
        cell: (info) => {
          const value = info.getValue() as number;
          return (
            <span className="text-gray-700">{value.toLocaleString()}</span>
          );
        },
      },
      {
        accessorKey: "monthMoreThan6",
        header: "Month >6",
        cell: (info) => {
          const value = info.getValue() as number;
          return (
            <span className="text-gray-700">{value.toLocaleString()}</span>
          );
        },
      },
      {
        accessorKey: "remarks",
        header: "Remarks",
        cell: (info) => (
          <span className="text-gray-700">
            {(info.getValue() as string) || "—"}
          </span>
        ),
      },
      {
        accessorKey: "actions",
        header: "Action",
        cell: () => (
          <div className="flex items-center space-x-1">
            <button className="p-1.5 hover:bg-gray-100 rounded transition-colors">
              <Download className="w-4 h-4 text-[#129990]" />
            </button>
            <button className="p-1.5 hover:bg-gray-100 rounded transition-colors">
              <Trash2 className="w-4 h-4 text-red-600" />
            </button>
          </div>
        ),
      },
      {
        id: "view",
        header: () => (
          <div className="flex items-center justify-center">
            <button
              type="button"
              className="flex items-center justify-center mx-auto text-[#129990]"
              title={
                expandedRows.size === data.length
                  ? "Collapse all"
                  : "Expand all"
              }
              onClick={() => {
                if (expandedRows.size === data.length) {
                  setExpandedRows(new Set());
                } else {
                  setExpandedRows(
                    new Set(data.map((_, index) => index.toString()))
                  );
                }
              }}
            >
              <ChevronDown
                size={22}
                className={
                  expandedRows.size === data.length
                    ? "rotate-180 transition-transform"
                    : "transition-transform"
                }
              />
            </button>
          </div>
        ),
        cell: ({ row }) => (
          <button
            onClick={() => toggleRowExpansion(row.id)}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            aria-label={
              expandedRows.has(row.id) ? "Collapse row" : "Expand row"
            }
          >
            {expandedRows.has(row.id) ? (
              <ChevronUp className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-600" />
            )}
          </button>
        ),
      },
    ];

    if (showSelected) {
      baseColumns.unshift({
        id: "select",
        header: () => (
          <div className="flex items-center justify-start">
            <input type="checkbox" />
          </div>
        ),
        cell: () => (
          <div className="flex items-center justify-start">
            <input type="checkbox" />
          </div>
        ),
      });
    }

    return baseColumns;
  }, [expandedRows, showSelected, toggleRowExpansion, data]);


const defaultVisibility: Record<string, boolean> = {
    select:false,
    srNo: true,
    poNumber: true,
    client: true,
    type: false,
    bu: false,
    details: false,
    date: false,
    currency: false,
    amount: false,
    advance: true,
    inco: true,
    month1: true,
    month2: true,
    month3: true,
    month4to6: true,
    monthMoreThan6: true,
    remarks: true,
    actions: true,
  };


  const [columnVisibility, setColumnVisibility] = useState(defaultVisibility);

  const table = useReactTable({
    data: filteredData,
    columns,
    onColumnOrderChange: setColumnOrder,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      columnOrder,
      columnVisibility,
    },
  });
//   if (loading) return <LoadingSpinner />;

  return (
    <>
      <div className="space-y-6">
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Filters Section */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">Status</label>
            <select
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#129990]"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col space-y-2 relative">
            <label className="text-sm font-medium text-gray-700">
              Created Date
            </label>
            <div
              className="border border-gray-300 rounded-md px-3 py-2 flex items-center justify-between cursor-pointer"
              onClick={() => setShowDatePicker(!showDatePicker)}
            >
              <span>
                {dateRange[0].startDate
                  ? `${dateRange[0].startDate.toLocaleDateString()} - ${
                      dateRange[0].endDate?.toLocaleDateString() || ""
                    }`
                  : "Select Date Range"}
              </span>
              <Calendar className="w-4 h-4 text-gray-500" />
            </div>

            {showDatePicker && (
              <div className="absolute z-10 top-16 left-0 bg-white shadow-lg rounded-md">
                <DateRange
                  editableDateInputs={true}
                  onChange={(item) => {
                    setDateRange([item.selection]);
                    if (item.selection.startDate && item.selection.endDate) {
                      setShowDatePicker(false);
                    }
                  }}
                  moveRangeOnFirstSelection={false}
                  ranges={dateRange}
                />
                <div className="flex justify-end p-2 border-t">
                  <button
                    className="text-sm text-[#129990] hover:text-[#0d7a73]"
                    onClick={() => {
                      setDateRange([
                        { startDate: null, endDate: null, key: "selection" },
                      ]);
                      setShowDatePicker(false);
                    }}
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}
          </div>

          <div></div>

          <div className="mt-10 flex items-center justify-end gap-4">
            <button
              type="button"
              className="flex items-center justify-center border border-[#129990] rounded-lg px-2 h-10 text-sm hover:bg-[#e6f7f5] transition"
              title="Download All Roles"
              onClick={() => exportToExcel(filteredData, "All_Roles")}
            >
              <Upload className="flex item-center justify-center text-[#129990]" />
            </button>

            <button
              type="button"
              className="flex items-center justify-center border border-[#129990] rounded-lg w-10 h-10 hover:bg-[#e6f7f5] transition"
              title="Refresh"
              onClick={() => window.location.reload()}
            >
              <svg
                width="20"
                height="20"
                fill="none"
                stroke="#129990"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <path d="M23 4v6h-6" />
                <path d="M1 20v-6h6" />
                <path d="M3.51 9a9 9 0 0 1 14.13-3.36L23 10M1 14l5.36 5.36A9 9 0 0 0 20.49 15" />
              </svg>
            </button>
            <form
              className="relative flex items-center"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="text"
                placeholder="Search"
                className="pl-4 pr-10 py-2 border border-[#129990] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#129990]/30 min-w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#129990]"
                tabIndex={-1}
                aria-label="Search"
              >
                <svg
                  width="18"
                  height="18"
                  fill="none"
                  stroke="#129990"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </button>
            </form>
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <DndContext
                onDragEnd={(event: DragEndEvent) => {
                  const { active, over } = event;
                  if (active.id !== over?.id) {
                    const oldIndex = columnOrder.indexOf(active.id as string);
                    const newIndex = columnOrder.indexOf(over?.id as string);
                    const newOrder = [...columnOrder];
                    newOrder.splice(oldIndex, 1);
                    newOrder.splice(newIndex, 0, active.id as string);
                    setColumnOrder(newOrder);
                  }
                }}
              >
                <colgroup>
                  {table.getVisibleLeafColumns().map((col) => (
                    <col key={col.id} className="font-medium min-w-full" />
                  ))}
                </colgroup>
                <thead className="bg-gray-50 rounded-xl">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header, index) => {
                        const isFirst = index === 0;
                        const isLast = index === headerGroup.headers.length - 1;

                        return (
                          <th
                            key={header.id}
                            className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200"
                            style={{ width: header.getSize() }}
                          >
                            <Droppable id={header.column.id}>
                              {isFirst || isLast ? (
                                <div className="px-1">
                                  {flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                  )}
                                </div>
                              ) : (
                                <Draggable id={header.column.id}>
                                  <div className="cursor-move hover:bg-blue-100 rounded px-1 py-1 transition duration-150 ease-in-out">
                                    {flexRender(
                                      header.column.columnDef.header,
                                      header.getContext()
                                    )}
                                  </div>
                                </Draggable>
                              )}
                            </Droppable>
                          </th>
                        );
                      })}
                    </tr>
                  ))}
                </thead>
              </DndContext>

              <tbody className="bg-white divide-y divide-gray-100">
                {table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-6 py-12 text-left text-gray-500"
                    >
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                          <svg
                            className="w-6 h-6 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        </div>
                        <p className="text-lg font-medium text-gray-900 mb-1">
                          No Roles found
                        </p>
                        <p className="text-sm text-gray-500">
                          There are no users to display at the moment.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <React.Fragment key={row.id}>
                      <tr
                        className={
                          expandedRows.has(row.id) && row.index === 0
                            ? "bg-[#d2f5f0]/50"
                            : row.index % 2 === 0
                            ? "bg-[#d2f5f0]/50"
                            : "bg-white"
                        }
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td
                            key={cell.id}
                            className="px-6 py-4 whitespace-nowrap text-sm border-b border-gray-100"
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </td>
                        ))}
                      </tr>

                      {expandedRows.has(row.id) && (
                        <ExpandedRow
                          row={row}
                          columnVisibility={columnVisibility}
                          editStates={editStates}
                          setEditStates={setEditStates}
                          editingRows={editingRows}
                          setEditingRows={setEditingRows}
                          fieldLabels={roleFieldLabels}
                          visibleColumnCount={
                            table.getVisibleLeafColumns().length
                          }
                          editableKeys={["name", "description"]}
                          detailsFields={[
                            "poNumber",
                            "client",
                            "type",
                            "bu",
                            "details",
                            "date",
                            "currency",
                            "amount",
                            "advance",
                            "inco",
                            "month1",
                            "month2",
                            "month3",
                            "month4to6",
                            "monthMoreThan6",
                            "remarks",
                          ]}
                          approvalFields={[
                            "createdBy",
                            "createdAt",
                            "approvedBy",
                            "approveddate",
                          ]}
                        />
                      )}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
            <PaginationFooter table={table} />
          </div>
        </div>
      </div>
    </>
  );
};
export default ExposureBucketingTable;
