// src/pages/AssignPermissionPage.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "../common/Layout";
import Button from "../ui/Button";

// ——— 1) Define pages, tabs & actions ———
type ActionDef = { name: string; label: string };
type TabDef = { name: string; label: string; actions: ActionDef[] };
type PageDef = { name: string; label: string; tabs: TabDef[] };

const PAGES: PageDef[] = [
  {
    name: "Roles.tsx",
    label: "Roles Page",
    tabs: [
      {
        name: "allRoles",
        label: "All Roles",
        actions: [
          { name: "create", label: "Create New Role" },
          { name: "view",   label: "View" },
          { name: "edit",   label: "Edit" },
          { name: "delete", label: "Delete" },
          { name: "export", label: "Export as CSV" },
          { name: "print",  label: "Print" },
        ],
      },
      {
        name: "pendingApproval",
        label: "Pending Approval",
        actions: [
          { name: "approve", label: "Approve" },
          { name: "reject",  label: "Reject" },
        ],
      },
    ],
  },
  // …add more pages here…
];

// ——— 2) LocalStorage helpers ———
type PagePermState = {
  loadPage: boolean;
  tabs: Record<
    string,
    {
      enabled: boolean;
      actions: Record<string, boolean>;
    }
  >;
};

function getStoredPerms(roleId: string): Record<string, PagePermState> {
  const all = JSON.parse(localStorage.getItem("rolePermissions") || "{}");
  return all[roleId] || {};
}

function setStoredPerms(roleId: string, perms: Record<string, PagePermState>) {
  const all = JSON.parse(localStorage.getItem("rolePermissions") || "{}");
  all[roleId] = perms;
  localStorage.setItem("rolePermissions", JSON.stringify(all));
}

function getAllRoles(): { id: string; name: string }[] {
  return JSON.parse(localStorage.getItem("roles") || "[]");
}

// ——— 3) Awaiting‐Approval helpers (unchanged) ———
function loadStatuses(): Record<string, string> {
  return JSON.parse(localStorage.getItem("roleStatuses") || "{}");
}
function saveStatuses(s: Record<string, string>) {
  localStorage.setItem("roleStatuses", JSON.stringify(s));
}

// ——— 4) Component ———
const AssignPermissionPage: React.FC = () => {
  const navigate = useNavigate();
  const params = new URLSearchParams(useLocation().search);
  const initialRoleId = params.get("roleId") || "";

  // which tab is active
  const [activeTab, setActiveTab] = useState<"assign" | "awaiting">("assign");

  // common state
  const [roles, setRoles] = useState(getAllRoles());
  const [selectedRole, setSelectedRole] = useState(initialRoleId);
  const [editMode, setEditMode] = useState(false);

  // assign grid state
  const [perms, setPerms] = useState<Record<string, PagePermState>>({});

  // awaiting grid state
  const [statuses, setStatuses] = useState<Record<string, string>>(() => {
    const s = loadStatuses();
    getAllRoles().forEach(r => {
      if (!s[r.id]) s[r.id] = "Pending";
    });
    return s;
  });
  const [awaitingSelected, setAwaitingSelected] = useState<Set<string>>(new Set());

  // load roles on mount
  useEffect(() => {
    setRoles(getAllRoles());
  }, []);

  // load perms whenever the selected role changes
  useEffect(() => {
    if (selectedRole) {
      setPerms(getStoredPerms(selectedRole));
      setEditMode(false);
    } else {
      setPerms({});
      setEditMode(false);
    }
  }, [selectedRole]);

  // ——— Assign tab toggles ———

  // toggle loadPage
  const toggleLoadPage = (pageName: string) => {
    setPerms(prev => {
      const old = prev[pageName] || {
        loadPage: false,
        tabs: Object.fromEntries(
          PAGES.find(p => p.name === pageName)!.tabs.map(t => [
            t.name,
            {
              enabled: false,
              actions: Object.fromEntries(t.actions.map(a => [a.name, false])),
            },
          ])
        ),
      };
      return {
        ...prev,
        [pageName]: {
          ...old,
          loadPage: !old.loadPage,
        },
      };
    });
  };

  // toggle tab enabled
  const toggleTabEnabled = (pageName: string, tabName: string) => {
    setPerms(prev => {
      const oldPage = prev[pageName]!;
      const oldTab = oldPage.tabs[tabName];
      return {
        ...prev,
        [pageName]: {
          ...oldPage,
          tabs: {
            ...oldPage.tabs,
            [tabName]: {
              ...oldTab,
              enabled: !oldTab.enabled,
            },
          },
        },
      };
    });
  };

  // toggle individual action
  const toggleAction = (pageName: string, tabName: string, action: string) => {
    setPerms(prev => {
      const oldPage = prev[pageName]!;
      const oldTab = oldPage.tabs[tabName];
      return {
        ...prev,
        [pageName]: {
          ...oldPage,
          tabs: {
            ...oldPage.tabs,
            [tabName]: {
              ...oldTab,
              actions: {
                ...oldTab.actions,
                [action]: !oldTab.actions[action],
              },
            },
          },
        },
      };
    });
  };

  // save assign changes
  const saveAssign = () => {
    setStoredPerms(selectedRole, perms);
    setEditMode(false);
    alert("Permissions saved!");
  };

  // ——— Awaiting tab toggles ———
  const toggleAwaiting = (id: string) => {
    setAwaitingSelected(s => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const bulkApprove = () => {
    setStatuses(s => {
      const next = { ...s };
      awaitingSelected.forEach(id => {
        next[id] = "Approved";
      });
      saveStatuses(next);
      return next;
    });
    setAwaitingSelected(new Set());
  };

  const bulkReject = () => {
    setStatuses(s => {
      const next = { ...s };
      awaitingSelected.forEach(id => {
        next[id] = "Rejected";
      });
      saveStatuses(next);
      return next;
    });
    setAwaitingSelected(new Set());
  };

  // ——— render Assign tab ———
  const renderAssign = () => (
    <>
      <div className="mb-4 flex items-center gap-4">
        <label className="font-semibold">Select Role:</label>
        <select
          className="border rounded p-2"
          value={selectedRole}
          onChange={e => setSelectedRole(e.target.value)}
        >
          <option value="">-- choose a role --</option>
          {roles.map(r => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
        {!editMode && selectedRole && (
          <Button color="Blue" onClick={() => setEditMode(true)}>
            Edit
          </Button>
        )}
      </div>

      {selectedRole && (
        <div className="overflow-auto max-h-[70vh]">
          <table className="w-full text-sm border-collapse">
            <tbody>
              {PAGES.map(page => (
                <React.Fragment key={page.name}>
                  {/* Page row */}
                  <tr className="bg-gray-100">
                    <td className="px-4 py-2 font-semibold">Page</td>
                    <td className="px-4 py-2">{page.label}</td>
                    <td className="px-4 py-2 text-center">
                      <input
                        type="checkbox"
                        disabled={!editMode}
                        checked={!!perms[page.name]?.loadPage}
                        onChange={() => toggleLoadPage(page.name)}
                      />
                    </td>
                    <td colSpan={2}></td>
                  </tr>

                  {/* Tab rows */}
                  {page.tabs.map(tabDef => (
                    <tr key={tabDef.name}>
                      <td></td>
                      <td className="px-4 py-2 italic">{tabDef.label}</td>
                      <td className="px-4 py-2 text-center">
                        <input
                          type="checkbox"
                          disabled={!editMode || !perms[page.name]?.loadPage}
                          checked={
                            perms[page.name]?.tabs[tabDef.name]?.enabled || false
                          }
                          onChange={() =>
                            toggleTabEnabled(page.name, tabDef.name)
                          }
                        />
                      </td>
                      <td colSpan={2} className="px-4 py-2">
                        {tabDef.actions.map(act => (
                          <label
                            key={act.name}
                            className="inline-flex items-center mr-6"
                          >
                            <input
                              type="checkbox"
                              disabled={
                                !editMode ||
                                !perms[page.name]?.tabs[tabDef.name]?.enabled
                              }
                              checked={
                                perms[page.name]?.tabs[tabDef.name]?.actions[
                                  act.name
                                ] || false
                              }
                              onChange={() =>
                                toggleAction(
                                  page.name,
                                  tabDef.name,
                                  act.name
                                )
                              }
                            />
                            <span className="ml-2">{act.label}</span>
                          </label>
                        ))}
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editMode && selectedRole && (
        <div className="mt-6 flex justify-end gap-3">
          <Button color="Blue" onClick={() => setEditMode(false)}>
            Cancel
          </Button>
          <Button color="Green" onClick={saveAssign}>
            Save
          </Button>
        </div>
      )}
    </>
  );

  // ——— render Awaiting tab ———
  const renderAwaiting = () => (
    <>
      <div className="overflow-x-auto mb-4">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2 text-center">
                <input
                  type="checkbox"
                  checked={
                    awaitingSelected.size === roles.length &&
                    roles.length > 0
                  }
                  onChange={() =>
                    setAwaitingSelected(prev =>
                      prev.size === roles.length
                        ? new Set()
                        : new Set(roles.map(r => r.id))
                    )
                  }
                />
              </th>
              {[
                "Role ID",
                "Role Name",
                "Description",
                "Start Time",
                "End Time",
                "Created At",
                "Status",
              ].map(h => (
                <th key={h} className="p-2 text-left">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {roles.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-4 text-center text-gray-400">
                  No roles awaiting approval.
                </td>
              </tr>
            ) : (
              roles.map(r => (
                <tr
                  key={r.id}
                  className="odd:bg-white even:bg-gray-100"
                >
                  <td className="p-2 text-center">
                    <input
                      type="checkbox"
                      checked={awaitingSelected.has(r.id)}
                      onChange={() => toggleAwaiting(r.id)}
                    />
                  </td>
                  <td className="p-2">{r.id}</td>
                  <td className="p-2">{r.name}</td>
                  <td className="p-2">{r.description}</td>
                  <td className="p-2">{r.startTime}</td>
                  <td className="p-2">{r.endTime}</td>
                  <td className="p-2">{r.createdAt}</td>
                  <td className="p-2">{statuses[r.id]}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="flex gap-3">
        <Button
          color="Green"
          onClick={bulkApprove}
          disabled={awaitingSelected.size === 0}
        >
          Approve
        </Button>
        <Button
          color="Red"
          onClick={bulkReject}
          disabled={awaitingSelected.size === 0}
        >
          Reject
        </Button>
      </div>
    </>
  );

  return (
    <Layout title="Role Permissions" showButton={false}>
      <div className="bg-white rounded-2xl shadow-card p-6">
        {/* Global tabs */}
        <div className="flex gap-6 border-b mb-6">
          <button
            onClick={() => setActiveTab("assign")}
            className={`pb-2 text-sm font-medium border-b-2 ${
              activeTab === "assign"
                ? "border-green-500 text-green-600"
                : "border-transparent text-gray-500 hover:text-green-600"
            }`}
          >
            Assign Permissions
          </button>
          <button
            onClick={() => setActiveTab("awaiting")}
            className={`pb-2 text-sm font-medium border-b-2 ${
              activeTab === "awaiting"
                ? "border-green-500 text-green-600"
                : "border-transparent text-gray-500 hover:text-green-600"
            }`}
          >
            Awaiting Approval
          </button>
        </div>

        {/* Tab content */}
        {activeTab === "assign" ? renderAssign() : renderAwaiting()}
      </div>
    </Layout>
  );
};

export default AssignPermissionPage;