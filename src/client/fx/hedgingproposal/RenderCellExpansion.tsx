
import React from "react";
import { type Row } from "@tanstack/react-table"; // import Row type from TanStack Table

type ExpandedRowProps = {
  row: Row<HedgingProposal>;
  columnVisibility: Record<string, boolean>;
  fieldLabels: Record<string, string>;
  visibleColumnCount: number;
  detailsFields: string[];
  approvalFields: string[];
  showDetailsSection?: boolean;
  showApprovalSection?: boolean;
};

const ExpandedRow: React.FC<ExpandedRowProps> = ({
  row,
  fieldLabels,
  visibleColumnCount,
  detailsFields,
  approvalFields,
  showDetailsSection = true,
  showApprovalSection = true,
}) => {
  const rowId = row.id;

  const visibleDetailsKeys = detailsFields.filter(
    (key) => key !== "select" && key !== "actions"
  );

  const visibleApprovalKeys = approvalFields.filter(
    (key) => key !== "select" && key !== "actions"
  );

  const renderField = (key: string) => {
    const label = fieldLabels[key] ?? key;
    let value =
      key === "role.name"
        ? row.original.role?.name ?? "—"
        : row.original[key];

    // Format date
    if (key === "createdDate") {
      const date = new Date(value as string);
      value = isNaN(date.getTime()) ? value : date.toLocaleDateString();
    }

    // Format boolean
    if (typeof value === "boolean") {
      value = value ? "Yes" : "No";
    }

    return (
      <div key={key} className="flex flex-col space-y-1">
        <label className="font-bold text-gray-600">{label}</label>
        <span className="font-medium text-gray-800">{value ?? "—"}</span>
      </div>
    );
  };

  return (
    <tr key={`${rowId}-expanded`}>
      <td colSpan={visibleColumnCount} className="px-6 py-4 bg-[#d2f5f0]/50">
        <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-semibold text-gray-800">
              Additional Information
            </h4>
          </div>

          {/* Details Section */}
          {showDetailsSection && visibleDetailsKeys.length > 0 && (
            <div className="mb-6">
              <h5 className="text-md font-medium text-gray-700 mb-3 border-b border-gray-200 pb-2">
                Details
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {visibleDetailsKeys.map(renderField)}
              </div>
            </div>
          )}

          {/* Approval Information Section */}
          {showApprovalSection && visibleApprovalKeys.length > 0 && (
            <div>
              <h5 className="text-md font-medium text-gray-700 mb-3 border-b border-gray-200 pb-2">
                Approval Information
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {visibleApprovalKeys.map(renderField)}
              </div>
            </div>
          )}

          {/* Show message if no fields are shown */}
          {visibleDetailsKeys.length === 0 && (
            <div className="text-center text-gray-500 py-4">
              No additional information to display
            </div>
          )}
        </div>
      </td>
    </tr>
  );
};

export default ExpandedRow;
