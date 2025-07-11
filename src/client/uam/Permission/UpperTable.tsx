import React, { useState, useMemo, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getPaginationRowModel,
  type ColumnDef,
} from "@tanstack/react-table";
import { Save } from "lucide-react";
import Button from "../../ui/Button";
import axios from "axios";
import LoadingSpinner from "../../ui/LoadingSpinner";
interface Table {
  RoleName: string;
  PageID: number;
  PageName: string;
}

interface Permissions {
  hasAccess: boolean;
  showCreateButton: boolean;
  showEditButton: boolean;
  showDeleteButton: boolean;
  showApproveButton: boolean;
  showRejectButton: boolean;
  canView: boolean;
  canUpload: boolean;
}

interface PageData {
  hasAccess: boolean;
  [key: string]: Permissions | boolean;
}

type PermissionKey = keyof Permissions;

interface PermissionData {
  role_name: string;
  pages: {
    [key: string]: PageData;
  };
}

interface prop {
  roleName: string;
}

const PermissionsTable: React.FC<prop> = ({ roleName }) => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState<boolean>(false);

  const [permissionData, setPermissionData] = useState<PermissionData>({
    role_name: roleName,
    pages: {
      entity: {
        hasAccess: false,
        default: {
          hasAccess: false,
          showCreateButton: false,
          showEditButton: false,
          showDeleteButton: false,
          showApproveButton: false,
          showRejectButton: false,
          canView: false,
          canUpload: false,
        },
      },
      hierarchical: {
        hasAccess: false,
        default: {
          hasAccess: false,
          showCreateButton: false,
          showEditButton: false,
          showDeleteButton: false,
          showApproveButton: false,
          showRejectButton: false,
          canView: false,
          canUpload: false,
        },
      },
      masters: {
        hasAccess: false,
        default: {
          hasAccess: false,
          showCreateButton: false,
          showEditButton: false,
          showDeleteButton: false,
          showApproveButton: false,
          showRejectButton: false,
          canView: false,
          canUpload: false,
        },
      },
      roles: {
        hasAccess: false,
        allTab: {
          hasAccess: false,
          showCreateButton: false,
          showEditButton: false,
          showDeleteButton: false,
          showApproveButton: false,
          showRejectButton: false,
          canView: false,
          canUpload: false,
        },
        uploadTab: {
          hasAccess: false,
          showCreateButton: false,
          showEditButton: false,
          showDeleteButton: false,
          showApproveButton: false,
          showRejectButton: false,
          canView: false,
          canUpload: false,
        },
        pendingTab: {
          hasAccess: false,
          showCreateButton: false,
          showEditButton: false,
          showDeleteButton: false,
          showApproveButton: false,
          showRejectButton: false,
          canView: false,
          canUpload: false,
        },
      },
      permissions: {
        hasAccess: false,
        allTab: {
          hasAccess: false,
          showCreateButton: false,
          showEditButton: false,
          showDeleteButton: false,
          showApproveButton: false,
          showRejectButton: false,
          canView: false,
          canUpload: false,
        },
        uploadTab: {
          hasAccess: false,
          showCreateButton: false,
          showEditButton: false,
          showDeleteButton: false,
          showApproveButton: false,
          showRejectButton: false,
          canView: false,
          canUpload: false,
        },
        pendingTab: {
          hasAccess: false,
          showCreateButton: false,
          showEditButton: false,
          showDeleteButton: false,
          showApproveButton: false,
          showRejectButton: false,
          canView: false,
          canUpload: false,
        },
      },
      "user-creation": {
        hasAccess: false,
        allTab: {
          hasAccess: false,
          showCreateButton: false,
          showEditButton: false,
          showDeleteButton: false,
          showApproveButton: false,
          showRejectButton: false,
          canView: false,
          canUpload: false,
        },
        uploadTab: {
          hasAccess: false,
          showCreateButton: false,
          showEditButton: false,
          showDeleteButton: false,
          showApproveButton: false,
          showRejectButton: false,
          canView: false,
          canUpload: false,
        },
        pendingTab: {
          hasAccess: false,
          showCreateButton: false,
          showEditButton: false,
          showDeleteButton: false,
          showApproveButton: false,
          showRejectButton: false,
          canView: false,
          canUpload: false,
        },
      },
      dashboard: {
        hasAccess: false,
        default: {
          hasAccess: false,
          showCreateButton: false,
          showEditButton: false,
          showDeleteButton: false,
          showApproveButton: false,
          showRejectButton: false,
          canView: false,
          canUpload: false,
        },
      },
      "exposure-upload": {
        hasAccess: false,
        allTab: {
          hasAccess: false,
          showCreateButton: false,
          showEditButton: false,
          showDeleteButton: false,
          showApproveButton: false,
          showRejectButton: false,
          canView: false,
          canUpload: false,
        },
        uploadTab: {
          hasAccess: false,
          showCreateButton: false,
          showEditButton: false,
          showDeleteButton: false,
          showApproveButton: false,
          showRejectButton: false,
          canView: false,
          canUpload: false,
        },
        pendingTab: {
          hasAccess: false,
          showCreateButton: false,
          showEditButton: false,
          showDeleteButton: false,
          showApproveButton: false,
          showRejectButton: false,
          canView: false,
          canUpload: false,
        },
      },
      "exposure-bucketing": {
        hasAccess: false,
        default: {
          hasAccess: false,
          showCreateButton: false,
          showEditButton: false,
          showDeleteButton: false,
          showApproveButton: false,
          showRejectButton: false,
          canView: false,
          canUpload: false,
        },
      },
      "hedging-proposal": {
        hasAccess: false,
        default: {
          hasAccess: false,
          showCreateButton: false,
          showEditButton: false,
          showDeleteButton: false,
          showApproveButton: false,
          showRejectButton: false,
          canView: false,
          canUpload: false,
        },
      },
      "hedging-dashboard": {
        hasAccess: false,
        default: {
          hasAccess: false,
          showCreateButton: false,
          showEditButton: false,
          showDeleteButton: false,
          showApproveButton: false,
          showRejectButton: false,
          canView: false,
          canUpload: false,
        },
      },
      fxstatusdash: {
        hasAccess: false,
        default: {
          hasAccess: false,
          showCreateButton: false,
          showEditButton: false,
          showDeleteButton: false,
          showApproveButton: false,
          showRejectButton: false,
          canView: false,
          canUpload: false,
        },
      },
    },
  });

  const mockData: Table[] = [
    { RoleName: roleName, PageID: 1, PageName: "entity" },
    { RoleName: roleName, PageID: 2, PageName: "hierarchical" },
    { RoleName: roleName, PageID: 3, PageName: "masters" },
    { RoleName: roleName, PageID: 4, PageName: "roles" },
    { RoleName: roleName, PageID: 5, PageName: "permissions" },
    { RoleName: roleName, PageID: 6, PageName: "user-creation" },
    { RoleName: roleName, PageID: 7, PageName: "dashboard" },
    { RoleName: roleName, PageID: 8, PageName: "exposure-upload" },
    { RoleName: roleName, PageID: 9, PageName: "exposure-bucketing" },
    { RoleName: roleName, PageID: 10, PageName: "hedging-proposal" },
    { RoleName: roleName, PageID: 11, PageName: "hedging-dashboard" },
    { RoleName: roleName, PageID: 12, PageName: "fxstatusdash" },
  ];

  const [data, setData] = useState<Table[]>(mockData);

  // Get tabs for a specific page
  const getTabsForPage = (pageName: string): string[] => {
    const pagesWithTabs = [
      "roles",
      "permissions",
      "user-creation",
      "exposure-upload",
    ];
    if (pagesWithTabs.includes(pageName)) {
      return ["allTab", "uploadTab", "pendingTab"];
    }
    return ["default"];
  };

  // Get page access status
  const getPageAccess = (pageName: string): boolean => {
    return permissionData.pages[pageName]?.hasAccess || false;
  };

  // Get current permissions for a page/tab
  const getPermissions = (pageName: string, tab: string): Permissions => {
    const pageData = permissionData.pages[pageName];
    if (pageData && pageData[tab] && typeof pageData[tab] === "object") {
      return pageData[tab] as Permissions;
    }
    return {
      hasAccess: false,
      showCreateButton: false,
      showEditButton: false,
      showDeleteButton: false,
      showApproveButton: false,
      showRejectButton: false,
      canView: false,
      canUpload: false,
    };
  };

  // Update page access
  const updatePageAccess = (pageName: string, hasAccess: boolean) => {
    setPermissionData((prev) => ({
      ...prev,
      pages: {
        ...prev.pages,
        [pageName]: {
          ...prev.pages[pageName],
          hasAccess,
        },
      },
    }));
  };

  // Update permissions for a page/tab
  const updatePermissions = (
    pageName: string,
    tab: string,
    field: PermissionKey,
    value: boolean
  ) => {
    setPermissionData((prev) => ({
      ...prev,
      pages: {
        ...prev.pages,
        [pageName]: {
          ...prev.pages[pageName],
          [tab]: {
            ...getPermissions(pageName, tab),
            [field]: value,
          },
        },
      },
    }));
  };
  
  const toggleRowSelection = (pageID: number, rowId: string) => {
    const newSelectedRows = new Set(selectedRows);
    const newExpandedRows = new Set(expandedRows);
    const pageData = data.find((row) => row.PageID === pageID);

    if (pageData) {
      const pageName = pageData.PageName;

      if (newSelectedRows.has(pageID)) {
        newSelectedRows.delete(pageID);
        newExpandedRows.delete(rowId);
        updatePageAccess(pageName, false);
      } else {
        newSelectedRows.add(pageID);
        newExpandedRows.add(rowId);
        updatePageAccess(pageName, true);
      }
    }

    setSelectedRows(newSelectedRows);
    setExpandedRows(newExpandedRows);
  };

  const toggleAllSelection = () => {
    if (selectedRows.size === data.length) {
      setSelectedRows(new Set());
      setExpandedRows(new Set());
      // Set all pages hasAccess to false
      data.forEach((row) => {
        updatePageAccess(row.PageName, false);
      });
    } else {
      const allPageIds = new Set(data.map((row) => row.PageID));
      const allRowIds = new Set(data.map((_, index) => index.toString()));
      setSelectedRows(allPageIds);
      setExpandedRows(allRowIds);
      // Set all pages hasAccess to true
      data.forEach((row) => {
        updatePageAccess(row.PageName, true);
      });
    }
  };

  const columns = useMemo<ColumnDef<Table>[]>(
    () => [
      {
        id: "select",
        header: () => (
          <div className="flex items-center justify-center">
            <input
              type="checkbox"
              checked={selectedRows.size === data.length && data.length > 0}
              onChange={toggleAllSelection}
              className="accent-primary w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex items-center justify-center">
            <input
              type="checkbox"
              checked={selectedRows.has(row.original.PageID)}
              onChange={() => toggleRowSelection(row.original.PageID, row.id)}
              className="accent-primary w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
            />
          </div>
        ),
      },
      {
        accessorKey: "srNo",
        header: "Sr No",
        cell: ({ row }) => (
          <span className="text-secondary-text">{row.index + 1}</span>
        ),
      },
      {
        accessorKey: "PageID",
        header: "Page ID",
        cell: ({ row }) => (
          <span className="text-secondary-text">{row.original.PageID}</span>
        ),
      },
      {
        accessorKey: "PageName",
        header: "Page Name",
        cell: ({ row }) => (
          <span className="text-secondary-text-dark font-semibold capitalize">
            {row.original.PageName.replace("-", " ")}
          </span>
        ),
      },
    //   {
    //     id: "accessStatus",
    //     header: "Access Status",
    //     cell: ({ row }) => (
    //       <span
    //         className={`px-2 py-1 text-xs rounded-full inline-block text-center w-24 ${
    //           getPageAccess(row.original.PageName)
    //             ? "bg-green-100 text-green-800"
    //             : "bg-red-100 text-red-800"
    //         }`}
    //       >
    //         {getPageAccess(row.original.PageName) ? "Access" : "No Access"}
    //       </span>
    //     ),
    //   },
    ],
    [selectedRows, expandedRows, data, permissionData]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const ExpandedRow = ({ row }: { row: any }) => {
    const tabs = getTabsForPage(row.original.PageName);
    const pageHasAccess = getPageAccess(row.original.PageName);

    return (
      <tr className="bg-primary-md">
        <td
          colSpan={table.getVisibleLeafColumns().length}
          className="px-6 py-4"
        >
          <div className="space-y-4">
            {tabs.map((tab) => (
              <div
                key={tab}
                className={`bg-secondary-color-lt rounded-lg p-4 shadow-sm border border-border ${
                  !pageHasAccess ? "opacity-50" : ""
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-secondary-text capitalize">
                    {tab === "default"
                      ? "Default Permissions"
                      : tab.replace("Tab", " Tab")}
                  </h4>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-secondary-text">Tab Access:</span>
                    <input
                      type="checkbox"
                      checked={
                        getPermissions(row.original.PageName, tab).hasAccess
                      }
                      onChange={(e) =>
                        updatePermissions(
                          row.original.PageName,
                          tab,
                          "hasAccess",
                          e.target.checked
                        )
                      }
                      disabled={!pageHasAccess}
                      className="accent-primary w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                  {[
                    { key: "showCreateButton" as PermissionKey, label: "Add" },
                    { key: "showEditButton" as PermissionKey, label: "Edit" },
                    {
                      key: "showDeleteButton" as PermissionKey,
                      label: "Delete",
                    },
                    {
                      key: "showApproveButton" as PermissionKey,
                      label: "Approve",
                    },
                    {
                      key: "showRejectButton" as PermissionKey,
                      label: "Reject",
                    },
                    { key: "canView" as PermissionKey, label: "View" },
                    { key: "canUpload" as PermissionKey, label: "Upload" },
                  ].map((permission) => (
                    <label
                      key={permission.key}
                      className={`flex items-center space-x-2 cursor-pointer ${
                        !pageHasAccess ||
                        !getPermissions(row.original.PageName, tab).hasAccess
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={
                          getPermissions(row.original.PageName, tab)[
                            permission.key
                          ]
                        }
                        onChange={(e) =>
                          updatePermissions(
                            row.original.PageName,
                            tab,
                            permission.key,
                            e.target.checked
                          )
                        }
                        disabled={
                          !pageHasAccess ||
                          !getPermissions(row.original.PageName, tab).hasAccess
                        }
                        className="accent-primary w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                        />
                      <span className="text-sm text-secondary-text">
                        {permission.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </td>
      </tr>
    );
  };

 
  useEffect(() => {
    const fetchPermissionData = async () => {
      try {
        setLoading(true);

        const response = await axios.post(
          "http://localhost:3143/api/permissions/permissionJSON",
          { roleName }
        );

        if (response.data && response.data.pages) {
          const pages = response.data.pages;

          setPermissionData({
            role_name: response.data.roleName,
            pages,
          });

          const newSelectedRows = new Set<number>();
          const newExpandedRows = new Set<string>();

          mockData.forEach((item, index) => {
            const pageKey = item.PageName;
            const pageData = pages[pageKey];

            if (!pageData) return;

            // Check if top-level hasAccess is true
            const hasPageAccess = pageData.hasAccess === true;

            // Check nested tabs like default, uploadTab, etc. for hasAccess: true
            const hasNestedTabAccess = Object.entries(pageData).some(
              ([key, value]) =>
                typeof value === "object" &&
                value !== null &&
                "hasAccess" in value &&
                value.hasAccess === true
            );

            if (hasPageAccess || hasNestedTabAccess) {
              newSelectedRows.add(item.PageID);
              newExpandedRows.add(index.toString());
            }
          });

          setSelectedRows(newSelectedRows);
          setExpandedRows(newExpandedRows);
        } else {
          alert("Permission data not found.");
        }
      } catch (error) {
        console.error("Error fetching permission data:", error);
        alert("Failed to load permission data.");
      } finally {
        setLoading(false);
      }
    };

    fetchPermissionData();
  }, [roleName]);

//   const handleSave = async () => {
//     const dataToSend = {
//       roleName: permissionData.role_name,
//       status:"Pending",
//       pages: permissionData.pages,
//     };
//     console.log(dataToSend);
// }

  const handleSave = async () => {
    const dataToSend = {
      roleName: permissionData.role_name,
      status:"pending",
      pages: permissionData.pages,
    };

    try {
      setLoading(true); // optional loading indicator

      const response = await axios.post(
        "http://localhost:3143/api/permissions/assign",
        dataToSend
      );
      console.log(dataToSend);

      if (response.data.success) {
        alert("Permissions saved successfully!");
        console.log("Server response:", response.data);
      } else {
        alert("Error saving permissions: " + response.data.error);
      }
    } catch (error) {
      setLoading;
      console.error("Request failed:", error);
      alert("Request failed. Check console.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-secondary-text">
            Role Permissions Management
          </h1>
        </div>
        <div>
          <Button onClick={handleSave} icon={<Save className="h-4 w-4" />}>
            Submit
          </Button>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <div className=" shadow-lg border border-border">
          <table className="min-w-full">
            <thead className="bg-body rounded-xl">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-4 text-left text-xs font-semibold text-primary uppercase tracking-wider border-b border-border"
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
            <tbody className="divide-y divide-border">
              {table.getRowModel().rows.map((row) => (
                <React.Fragment key={row.id}>
                  <tr
                    className={
                      row.index % 2 === 0 
                          ? "bg-primary-md"
                          : "bg-secondary-color-lt"
                    }
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-6 py-4 whitespace-nowrap text-sm"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                  {expandedRows.has(row.id) && <ExpandedRow row={row} />}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PermissionsTable;
