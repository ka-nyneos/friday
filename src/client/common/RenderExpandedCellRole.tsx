import React from "react";
import Button from "../ui/Button";
import axios from "axios";

type ExpandedRowProps = {
  row: any;
  columnVisibility: Record<string, boolean>;
  editStates: Record<string, Partial<UserType>>;
  setEditStates: React.Dispatch<
    React.SetStateAction<Record<string, Partial<UserType>>>
  >;
  editingRows: Set<string>;
  setEditingRows: React.Dispatch<React.SetStateAction<Set<string>>>;
  fieldLabels: Record<string, string>;
  visibleColumnCount: number;
  editableKeys?: string[];
  detailsFields: string[];
  approvalFields: string[];
  showDetailsSection?: boolean;
  showApprovalSection?: boolean;
};

const ExpandedRow: React.FC<ExpandedRowProps> = ({
  row,
  // columnVisibility,
  editStates,
  setEditStates,
  editingRows,
  setEditingRows,
  fieldLabels,
  visibleColumnCount,
  editableKeys = [],
  detailsFields,
  approvalFields,
  showDetailsSection = true,
  showApprovalSection = true,
}) => {
  const rowId = row.id;

  const isEditing = editingRows.has(rowId);
  const editValues = editStates[rowId] || {};

  const visibleDetailsKeys = detailsFields.filter(
    (key) => key !== "select" && key !== "actions"
  );

  const visibleApprovalKeys = approvalFields.filter(
    (key) => key !== "select" && key !== "actions"
  );

  const handleChange = (key: keyof UserType, value: string | boolean) => {
    setEditStates((prev) => ({
      ...prev,
      [rowId]: {
        ...prev[rowId],
        [key]: value,
      },
    }));
  };

  const getChangedFields = (
  original: UserType,
  edited: Partial<UserType>
): Partial<UserType> => {
  const changes: Partial<UserType> = {};
  for (const key in edited) {
    if (edited[key as keyof UserType] !== original[key as keyof UserType]) {
      changes[key as keyof UserType] = edited[key as keyof UserType];
    }
  }
  return changes;
};




  const handleEditToggle = async () => {
  if (isEditing) {
    const changedFields = getChangedFields(row.original, editValues);

    if (Object.keys(changedFields).length === 0) {
      // No changes made
      setEditingRows((prev) => {
        const newSet = new Set(prev);
        newSet.delete(rowId);
        return newSet;
      });
      return;
    }

    try {
      const res = await axios.post(
        `http://localhost:3143/api/roles/${row.original.id}/update`,
        changedFields
      );
      if (res.data.success) {
        alert("Role updated successfully!");
        console.log("Updated successfully:", res.data.role);

        // Replace original with updated role
        row.original = res.data.role;

        // Exit editing mode
        setEditingRows((prev) => {
          const newSet = new Set(prev);
          newSet.delete(rowId);
          return newSet;
        });
      } else {
        console.error("Update failed:", res.data.message);
      }
    } catch (error) {
      console.error("Error updating role:", error);
    }
  } else {
    setEditStates((prev) => ({
      ...prev,
      [rowId]: { ...row.original },
    }));
    setEditingRows((prev) => new Set(prev).add(rowId));
  }
};

  const renderField = (key: string) => {
    const typedKey = key as keyof UserType;
    const label = fieldLabels[key] ?? key;
    const isEditable = editableKeys.includes(key);
    let value =
      key === "role.name"
        ? row.original.role?.name ?? "—"
        : isEditing
        ? editValues[typedKey]
        : row.original[typedKey];

    // Format date
    if (!isEditing && typedKey === "createdDate") {
      const date = new Date(value as string);
      value = isNaN(date.getTime()) ? value : date.toLocaleDateString();
    }

    // Format boolean
    if (!isEditing && typeof value === "boolean") {
      value = value ? "Yes" : "No";
    }

    return (
      <div key={key} className="flex flex-col space-y-1">
        <label className="font-bold text-gray-600">{label}</label>
        {isEditing && isEditable ? (
          typeof row.original[typedKey] === "boolean" ? (
            <div>
              <select
                className="border rounded px-2 py-1 text-sm bg-white shadow-sm"
                value={(editValues[typedKey] ? "true" : "false") as string}
                onChange={(e) =>
                  handleChange(typedKey, e.target.value === "true")
                }
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
          ) : (
            <input
              className="border rounded px-2 py-1 text-sm bg-white shadow-sm"
              value={(value as string) || ""}
              onChange={(e) => handleChange(typedKey, e.target.value)}
            />
          )
        ) : (
          <span className="font-medium text-gray-800">{value ?? "—"}</span>
        )}
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
            <div>
              <Button onClick={handleEditToggle}>
                {isEditing ? "Save" : "Edit"}
              </Button>
            </div>
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

          {/* Show message if no fields are hidden */}
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
