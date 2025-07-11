import React, { useState, useEffect } from "react";
import axios from "axios";
import UpperTable from "./UpperTable";
import LoadingSpinner from "../../ui/LoadingSpinner";
const AssignPermission: React.FC = () => {
  const [roles, setRoles] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    axios
      .get("http://localhost:3143/roles/roles")
      .then(({ data }) => {
        setLoading(false);
        setRoles(data.roles);
      })
      .catch((error) => {
        setLoading(false);
        console.error("Error fetching roles:", error);
      });
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-end justify-between w-full">
          <div className="w-full md:w-1/4">
            <label className="block text-sm font-medium text-secondary-text mb-1">
              Select Role
            </label>
            <select
              className="w-full px-3 py-2 bg-secondary-color-lt text-secondary-text border border-border rounded-md focus:outline-none "
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <option value="">Select a Role</option>
              {roles.map((role, index) => (
                <option key={index} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {selectedRole && <UpperTable roleName={selectedRole} />}
    </div>
  );
};

export default AssignPermission;
