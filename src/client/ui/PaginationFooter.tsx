import {
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from "lucide-react";
import { type Table } from "@tanstack/react-table";

interface PaginationFooterProps<T> {
  table: Table<T>;
}

const PaginationFooter = <T,>({ table }: PaginationFooterProps<T>) => {
  const pagination = table.getState().pagination;
  const totalRows = table.getCoreRowModel().rows.length;
  const firstItem = pagination.pageIndex * pagination.pageSize + 1;
  const lastItem = Math.min(
    (pagination.pageIndex + 1) * pagination.pageSize,
    totalRows
  );

  return (
    <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
      <div className="text-sm text-gray-700">
        Showing {firstItem} to {lastItem} of {totalRows} results
      </div>

      <div className="flex items-center space-x-2">
        <select
          value={pagination.pageSize}
          onChange={(e) => table.setPageSize(Number(e.target.value))}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          {[10, 20, 30, 40, 50].map((pageSize) => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          ))}
        </select>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="px-3 py-1 text-sm text-gray-700">
            Page {pagination.pageIndex + 1} of {table.getPageCount()}
          </span>

          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaginationFooter;