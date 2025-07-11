import {
  ChevronDown,
  ChevronUp,
  Download,
  Upload,
  Trash2,
  Calendar,
} from "lucide-react";

import { DateRange } from "react-date-range";

import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { exportToExcel } from "../../ui/exportToExcel";

import { useMemo, useState, useCallback } from "react";
import { Draggable } from "../../common/Draggable";
import { Droppable } from "../../common/Droppable";
import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import React from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getPaginationRowModel,
  type ColumnDef,
} from "@tanstack/react-table";
import ExpandedRow from "../../common/RenderExpandedCell";
// import axios from "axios";
import PaginationFooter from "../../ui/PaginationFooter";
// import LoadingSpinner from '../../ui/LoadingSpinner';
import ExposureUpload from "./index";

const fieldLabels: Record<string, string> = {
  id: "ID",
  refNo: "Reference No",
  type: "Type",
  bu: "Business Unit",
  vendorBeneficiary: "Vendor / Beneficiary",
  amount: "Amount",
  currency: "Currency",
  maturityExpiry: "Maturity / Expiry",
  linkedId: "Linked ID",
  detail: "Details",
  status: "Status",
  UploadBy: "Uploaded By",
  UploadDate: "Upload Date",
  checkerComments: "Checker Comments",
};

const AllUser: React.FC = () => {
  // const [data] = useState<UserType[]>(sampleUsers);
  const [columnOrder, setColumnOrder] = useState<string[]>([]);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [editStates, setEditStates] = useState<
    Record<string, Partial<ExposureRequest>>
  >({});
  const [searchTerm, setSearchTerm] = useState("");
  const [originalData, setOriginalData] = useState<ExposureRequest[]>([]); // Store original unfiltered data
  const [statusFilter, setStatusFilter] = useState<string>("all"); // For status dropdown
  const [showDatePicker, setShowDatePicker] = useState(false); // Control date picker visibility
  const [dateRange, setDateRange] = useState([
    // For date range selection
    {
      startDate: null as Date | null,
      endDate: null as Date | null,
      key: "selection",
    },
  ]);

  const [editingRows, setEditingRows] = useState<Set<string>>(new Set());
  const [showSelected, setShowSelected] = useState<boolean>(false);
  const [data, setData] = useState<UserType[]>([]);
  // const [loading, setloading] = useState(true);

  const statusOptions = useMemo(() => {
    const options = new Set<string>();
    originalData.forEach((user) => {
      if (user.status) options.add(user.status);
    });
    return ["all", ...Array.from(options)];
  }, [originalData]);

  const toggleRowExpansion = useCallback((rowId: string) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(rowId)) {
        newSet.delete(rowId);
      } else {
        newSet.add(rowId);
      }
      return newSet;
    });
  }, []);

  // const handleDelete = (userId: number) => {
  //   if (!window.confirm("Are you sure you want to delete this user?")) return;

  //   axios
  //     .post(`http://localhost:3143/api/users/${userId}/delete`)
  //     .then((response) => {
  //       const data = response.data;
  //       alert(
  //         `User delete requested successfully: ${
  //           data.deleted?.name || "Unnamed User"
  //         }`
  //       );

  //       // Update the users list by removing the deleted user
  //       setData((prevUsers) => prevUsers.filter((user) => user.id !== userId));
  //     })
  //     .catch((error) => {
  //       console.error("Delete error:", error);
  //       const message =
  //         error.response?.data?.message ||
  //         error.response?.data?.error ||
  //         "An error occurred while deleting the user.";
  //       alert(`Error: ${message}`);
  //     });
  // };
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
      result = result.filter((user) => user.status === statusFilter);
    }

    // Apply date range filter
    if (dateRange[0].startDate && dateRange[0].endDate) {
      const start = new Date(dateRange[0].startDate);
      const end = new Date(dateRange[0].endDate);

      // Set time to beginning and end of day for complete coverage
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      result = result.filter((user) => {
        if (!user.createdDate) return false;
        const userDate = new Date(user.createdDate);
        return userDate >= start && userDate <= end;
      });
    }

    return result;
  }, [searchTerm, originalData, statusFilter, dateRange]);

  const columns = useMemo<ColumnDef<ExposureRequest>[]>(() => {
    const baseColumns: ColumnDef<ExposureRequest>[] = [
      // Sr No column (row index + 1)
      {
        accessorKey: "srNo",
        header: "Sr No",
        cell: ({ row }) => (
          <span className="text-gray-700">{row.index + 1}</span>
        ),
      },

      // Auth Type
      {
        accessorKey: "authenticationType",
        header: "Auth Type",
        cell: (info) => (
          <span className="text-gray-700">{info.getValue() as string}</span>
        ),
      },

      // Employee Name
      {
        accessorKey: "employeeName",
        header: "Employee Name",
        cell: (info) => (
          <span className="font-medium text-gray-900">
            {info.getValue() as string}
          </span>
        ),
      },

      // Username
      {
        accessorKey: "username",
        header: "Username",
        cell: (info) => (
          <span className="text-gray-700">{info.getValue() as string}</span>
        ),
      },

      // Email
      {
        accessorKey: "email",
        header: "Email",
        cell: (info) => (
          <span className="text-gray-700">{info.getValue() as string}</span>
        ),
      },

      // Mobile
      {
        accessorKey: "mobile",
        header: "Mobile",
        cell: (info) => (
          <span className="text-gray-700">{info.getValue() as string}</span>
        ),
      },

      // Address
      {
        accessorKey: "address",
        header: "Address",
        cell: (info) => (
          <span className="text-gray-700">{info.getValue() as string}</span>
        ),
      },

      // Business Unit
      {
        accessorKey: "businessUnitName",
        header: "Business Unit",
        cell: (info) => (
          <span className="text-gray-700">{info.getValue() as string}</span>
        ),
      },

      // Created By
      {
        accessorKey: "createdBy",
        header: "Created By",
        cell: (info) => (
          <span className="text-gray-700">{info.getValue() as string}</span>
        ),
      },

      // Created Date (formatted)
      {
        accessorKey: "createdDate",
        header: "Created Date",
        cell: (info) => {
          const dateStr = info.getValue() as string;
          const date = new Date(dateStr);
          return (
            <span className="text-gray-700">
              {isNaN(date.getTime()) ? dateStr : date.toLocaleDateString()}
            </span>
          );
        },
      },

      // Status Change Request (Boolean display)
      // {
      //   accessorKey: "statusChangeRequest",
      //   header: "Status Change Request",
      //   cell: (info) => (
      //     <span className="text-gray-700">
      //       {info.getValue() ? "Yes" : "No"}
      //     </span>
      //   ),
      // },

      // Status (colored badge)
      {
        accessorKey: "status",
        header: "Status",
        cell: (info) => {
          const rawStatus = info.getValue();
          if (!rawStatus || typeof rawStatus !== "string") {
            return (
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-500">
                —
              </span>
            );
          }

          const status =
            rawStatus.charAt(0).toUpperCase() +
            rawStatus.slice(1).toLowerCase();

          const statusColors: Record<string, string> = {
            Approved: "bg-green-100 text-green-800",
            appoved: "bg-green-100 text-green-800", // typo fallback
            pending: "bg-yellow-100 text-yellow-800",
            "Delete-approval": "bg-yellow-100 text-yellow-800",
            "delete-approval": "bg-yellow-100 text-yellow-800",
            Rejected: "bg-red-100 text-red-800",
            rejected: "bg-red-100 text-red-800",
            "Awaiting-approval": "bg-yellow-100 text-yellow-800",
            Inactive: "bg-gray-200 text-gray-700",
          };

          return (
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full ${
                statusColors[status] || "bg-gray-100 text-gray-800"
              }`}
            >
              {status}
            </span>
          );
        },
      },

      // Actions (download + delete)
      {
        accessorKey: "actions",
        header: "Action",
        cell: () => {
          // const user = row.original as ExposureRequest;
          return (
            <div className="flex items-center space-x-1">
              <button
                className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                // onClick={() =>
                //   exportToExcel([user], `Role_${user.username || user.id}`)
                // }
              >
                <Download className="w-4 h-4 text-[#129990]" />
              </button>
              <button
                className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                // onClick={() => handleDelete(user.id)}
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </button>
            </div>
          );
        },
      },

      // Row expansion toggle
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

    // Optional checkbox column for multi-select
    if (showSelected) {
      baseColumns.unshift({
        id: "select",
        header: () => (
          <div className="flex items-center justify-center">
            <input type="checkbox" />
          </div>
        ),
        cell: () => (
          <div className="flex items-center justify-center">
            <input type="checkbox" />
          </div>
        ),
      });
    }

    return baseColumns;
  }, [expandedRows, showSelected, toggleRowExpansion, data]);

  const defaultVisibility: Record<string, boolean> = {
    select: false,
    srNo: false,
    id: false,
    refNo: false,
    type: false,
    bu: true,
    vendorBeneficiary: true,
    amount: true,
    currency: true,
    maturityExpiry: true,
    linkedId: false,
    detail: false,
    status: false,
    UploadBy: false,
    UploadDate: false,
    checkerComments: false,
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
  // if (loading) return <LoadingSpinner />;
  return (
    <div className="space-y-6">
      {/* Filters and Search Row */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Status Filter */}
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

        {/* Date Range Filter */}
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
                  setDateRange([
                    {
                      ...item.selection,
                      startDate: item.selection.startDate,
                      endDate: item.selection.endDate,
                    },
                  ]);
                }}
                moveRangeOnFirstSelection={false}
                ranges={dateRange}
              />
              <div className="flex justify-between p-2 border-t">
                <button
                  className="px-3 py-1 bg-gray-100 rounded-md text-sm hover:bg-gray-200"
                  onClick={() => setShowDatePicker(false)}
                >
                  Close
                </button>
                <button
                  className="px-3 py-1 bg-[#129990] text-white rounded-md text-sm hover:bg-[#0d7a73]"
                  onClick={() => {
                    if (dateRange[0].startDate && dateRange[0].endDate) {
                      setShowDatePicker(false);
                    }
                  }}
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Empty column for spacing */}
        <div></div>

        {/* Search and Action Buttons */}
        <div className="flex items-center justify-end gap-4">
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

      {/* Table Section */}
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
                  <col key={col.id} className="font-medium min-w-[150px]" />
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
                    className="px-6 py-12 text-center text-gray-500"
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
                        No users found
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
                        fieldLabels={fieldLabels}
                        visibleColumnCount={
                          table.getVisibleLeafColumns().length
                        }
                        detailsFields={[
                          "id",
                          "authenticationType",
                          "employeeName",
                          "username",
                          "email",
                          "mobile",
                          "address",
                          "businessUnitName",
                        ]}
                        approvalFields={[
                          "createdBy",
                          "createdDate",
                          "status",
                          "approvedBy",
                          "approvedAt",
                          "approvalComment",
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
  );
};
export default AllUser;
