
import React, { useState, useEffect, useMemo} from "react";
import Button from "../../ui/Button";
import { Upload } from "lucide-react";
import { exportToExcel } from "../../ui/exportToExcel";
import { Draggable } from "../../common/Draggable";
import { Droppable } from "../../common/Droppable";
import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";

// Types
interface PermissionData {
  srNo?: number;
  RoleName: string;
  UpdatedBy: string;
  UpdatedDate: string;
  Status: string;
}

const TableContent: React.FC<{
  data: PermissionData[];
  searchTerm: string;
  showSelected: boolean;
  onSearchChange: (term: string) => void;
}> = ({ data, searchTerm, showSelected, onSearchChange }) => {
  const [columnOrder, setColumnOrder] = useState<string[]>([]);
  
   const filteredData = useMemo(() => {
    if (!searchTerm || !searchTerm.trim()) return data;
    const lowerSearch = searchTerm.toLowerCase().trim();
    return data.filter((user) =>
      Object.entries(user)
        .flatMap(([_, value]) =>
          typeof value === "object" && value !== null
            ? Object.values(value)
            : [value]
        )
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(lowerSearch))
    );
  }, [searchTerm, data]);

  const columns = useMemo<ColumnDef<PermissionData>[]>(() => {
    const baseColumns: ColumnDef<PermissionData>[] = [
      {
        accessorKey: "srNo",
        header: "Sr No",
        cell: ({ row }) => (
          <span className="text-gray-700">{row.index + 1}</span>
        ),
      },
      {
        accessorKey: "RoleName",
        header: "Role Name",
        cell: (info) => (
          <span className="text-gray-700">{info.getValue() as string}</span>
        ),
      },
      {
        accessorKey: "UpdatedBy",
        header: "Updated By",
        cell: (info) => (
          <span className="text-gray-700">{info.getValue() as string}</span>
        ),
      },
      {
        accessorKey: "UpdatedDate",
        header: "Updated Date",
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
      {
        accessorKey: "Status",
        header: "Status",
        cell: (info) => {
          const status = info.getValue() as string;
          const statusColors = {
            Active: "bg-green-100 text-green-800",
            Pending: "bg-yellow-100 text-yellow-800",
            Inactive: "bg-gray-200 text-gray-700",
          };
          return (
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full ${
                statusColors[status as keyof typeof statusColors] ||
                "bg-gray-100 text-gray-800"
              }`}
            >
              {status}
            </span>
          );
        },
      },
    ];

    if (showSelected) {
      baseColumns.unshift({
        id: "select",
        header: ({ table }) => (
          <div className="flex items-center justify-start">
            <input
              type="checkbox"
              checked={table.getIsAllPageRowsSelected()}
              onChange={table.getToggleAllPageRowsSelectedHandler()}
              className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex items-center justify-start">
            <input
              type="checkbox"
              checked={row.getIsSelected()}
              onChange={row.getToggleSelectedHandler()}
              className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
            />
          </div>
        ),
      });
    }

    return baseColumns;
  }, [showSelected]);

  const defaultVisibility: Record<string, boolean> = {
    select: true,
    srNo: true,
    RoleName: true,
    UpdatedBy: true,
    UpdatedDate: true,
    Status: true,
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

  useEffect(() => {
  if (columnOrder.length === 0) {
    setColumnOrder(table.getAllLeafColumns().map((col) => col.id));
  }
}, [table, columnOrder]);
    

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = columnOrder.indexOf(active.id as string);
      const newIndex = columnOrder.indexOf(over?.id as string);
      const newOrder = [...columnOrder];
      newOrder.splice(oldIndex, 1);
      newOrder.splice(newIndex, 0, active.id as string);
      setColumnOrder(newOrder);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div></div>
        <div></div>
        <div></div>
        <div className="mt-10 flex items-center justify-end gap-4">
          <button
            type="button"
            className="flex items-center justify-center border border-[#129990] rounded-lg px-2 h-10 text-sm hover:bg-[#e6f7f5] transition"
            title="Download All Roles"
            onClick={() => exportToExcel(filteredData, "All_Roles")}
          >
            <Upload className="text-[#129990]" />
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
              onChange={(e) => onSearchChange(e.target.value)}
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

      {/* Action Buttons */}
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-2 min-w-[12rem]">
          <Button>Approve</Button>
          <Button>Reject</Button>
        </div>
      </div>

      {/* Table with DndContext properly positioned */}
      <div className="w-full overflow-x-auto">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          <DndContext onDragEnd={handleDragEnd}>
            <table className="min-w-full divide-y divide-gray-200">
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
              <tbody className="bg-white divide-y divide-gray-100">
                {table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      <div className="flex flex-col items-center">
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
                    <tr
                      key={row.id}
                      className={
                        row.index % 2 === 0 ? "bg-[#d2f5f0]/50" : "bg-white"
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
                  ))
                )}
              </tbody>
            </table>
          </DndContext>
        </div>
      </div>
    </div>
  );
};

export default TableContent;