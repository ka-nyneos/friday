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
    <div className="bg-secondary-color px-6 py-4 border-t border-border flex items-center justify-between">
      <div className="text-sm text-secondary-text">
        Showing {firstItem} to {lastItem} of {totalRows} results
      </div>

      <div className="flex items-center space-x-2">
        <select
          value={pagination.pageSize}
          onChange={(e) => table.setPageSize(Number(e.target.value))}
          className="px-3 py-1 mr-6 border border-primary bg-secondary-color text-primary rounded-md text-sm focus:outline-none"
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
            className="p-1 rounded-md bg-primary-xl text-primary hover:bg-primary-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="p-1 rounded-md bg-primary-xl text-primary hover:bg-primary-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="px-3 py-1 text-sm text-secondary-text">
            Page {pagination.pageIndex + 1} of {table.getPageCount()}
          </span>

          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="p-1 rounded-md bg-primary-xl text-primary hover:bg-primary-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="p-1 rounded-md bg-primary-xl text-primary hover:bg-primary-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaginationFooter;