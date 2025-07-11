import React from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import type { CellContext } from "@tanstack/react-table";

interface PreviewTableProps {
  headers: string[];
  rows: string[][];
  onRemoveRow: (index: number) => void;
}

const PreviewTable: React.FC<PreviewTableProps> = ({
  headers,
  rows,
  onRemoveRow,
}) => {
  const columns = React.useMemo<ColumnDef<Record<string, string>>[]>(
    () => [
      ...headers.map((header, index) => ({
        accessorKey: `col_${index}`,
        header: () => (
          <span
            className={`font-semibold ${
              !header.trim() ? "text-red-500" : "text-gray-700"
            }`}
          >
            {header.trim() || `Missing Header (${index + 1})`}
          </span>
        ),
        cell: (info: CellContext<Record<string, string>, unknown>) => {
          const value = info.getValue() as string;
          const isMissing =
            !value || value.trim() === "" || value.trim() === '""';
          return (
            <span
              className={`text-sm ${
                isMissing ? "bg-red-300 text-black italic" : "text-gray-900"
              }`}
            >
              {isMissing ? "(Missing)" : value}
            </span>
          );
        },
      })),
      {
        id: "actions", // ✅ extra column for actions
        header: () => <span className="text-gray-700">Actions</span>,
        cell: ({ row }) => (
          <button
            className="text-red-600 hover:underline text-sm"
            onClick={() => onRemoveRow(row.index)}
          >
            Remove
          </button>
        ),
      },
    ],
    [headers, onRemoveRow]
  );

  const data = React.useMemo(
    () =>
      rows.map((row) => {
        const obj: Record<string, string> = {};
        row.forEach((value, idx) => {
          obj[`col_${idx}`] = value || "";
        });
        return obj;
      }),
    [rows]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (!headers.length || !rows.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No data to preview</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="sticky top-0 z-10 bg-gradient-to-b from-green-200 to-blue-100">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider border-r border-gray-200 last:border-r-0"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.map((row, index) => (
              <tr
                key={row.id}
                className={`hover:bg-gray-50 ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                }`}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-4 py-3 whitespace-nowrap text-sm border-r border-gray-200 last:border-r-0"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length > 50 && (
        <div className="bg-gray-50 px-4 py-2 text-sm text-gray-600 border-t">
          Showing first 50 rows of {rows.length} total rows
        </div>
      )}
    </div>
  );
};

export default PreviewTable;