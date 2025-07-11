"use client";

import React, { useState, useEffect } from "react";
import Layout from "../../common/Layout";
import Button from "../../ui/Button";

type Configuration = {
  id?: number;
  name: string;
  type: "Hosted" | "Whitelabel";
  logoUrl?: string;
  status: "pending" | "approved";
};

const DeploymentMaster = () => {
  const [activeTab, setActiveTab] = useState<"pending" | "all">("pending");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Omit<Configuration, "id" | "status">>({ 
    name: "", 
    type: "Hosted", 
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [previewLogo, setPreviewLogo] = useState<string | null>(null);
  const [configurations, setConfigurations] = useState<Configuration[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchConfigurations();
  }, []);

  const fetchConfigurations = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/deployment-configs');
      const data = await response.json();
      setConfigurations(data);
    } catch (error) {
      console.error("Failed to fetch configurations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const isActiveTab = (id: "pending" | "all") => activeTab === id;

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setPreviewLogo(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("type", formData.type);
    if (logoFile) {
      formDataToSend.append("logo", logoFile);
    }

    try {
      let response;
      if (editId) {
        // Update existing configuration
        formDataToSend.append("id", editId.toString());
        response = await fetch(`/api/deployment-configs/${editId}`, {
          method: "PUT",
          body: formDataToSend,
        });
      } else {
        // Create new configuration
        response = await fetch("/api/deployment-configs", {
          method: "POST",
          body: formDataToSend,
        });
      }

      if (!response.ok) {
        throw new Error("Failed to save configuration");
      }

      // Refresh the list
      await fetchConfigurations();
      resetForm();
    } catch (error) {
      console.error("Error saving configuration:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this configuration?")) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/deployment-configs/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete configuration");
      }

      // Refresh the list
      await fetchConfigurations();
    } catch (error) {
      console.error("Error deleting configuration:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (config: Configuration) => {
    setFormData({
      name: config.name,
      type: config.type,
    });
    setPreviewLogo(config.logoUrl || null);
    setEditId(config.id || null);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({ name: "", type: "Hosted" });
    setLogoFile(null);
    setPreviewLogo(null);
    setEditId(null);
    setShowForm(false);
  };

  const handleApprove = async (id: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/deployment-configs/${id}/approve`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to approve configuration");
      }

      // Refresh the list
      await fetchConfigurations();
    } catch (error) {
      console.error("Error approving configuration:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
    {/* <Layout title="Deployment Master"> */}
      <div className="w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Deployment Configuration</h2>
          {!showForm && (
            <Button 
              categories="Medium" 
              color="Green" 
              type="button" 
              onClick={() => setShowForm(true)}
              disabled={isLoading}
            >
              <span className="text-white">+ New Configuration</span>
            </Button>
          )}
        </div>

        {/* Tabs */}
        {!showForm && (
          <>
            <div className="flex space-x-2 border-b mb-4">
              {[
                { id: "pending", label: "Awaiting Configuration Approval" },
                { id: "all", label: "All Configurations" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as "pending" | "all")}
                  className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium rounded-t-lg border-b-2 transition-all duration-200 ${
                    isActiveTab(tab.id as "pending" | "all")
                      ? "bg-green-700 text-white border-green-700 shadow-sm"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-gray-800"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
              </div>
            ) : activeTab === "pending" ? (
              <div className="grid gap-4">
                {configurations
                  .filter((conf) => conf.status === "pending")
                  .map((conf) => (
                    <div key={conf.id} className="flex items-center justify-between p-4 bg-white border rounded shadow">
                      <div className="flex items-center gap-4">
                        {conf.logoUrl && <img src={conf.logoUrl} alt="Logo" className="h-8 w-8 rounded" />}
                        <div>
                          <div className="font-medium">{conf.name}</div>
                          <div className="text-sm text-gray-600">{conf.type}</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          categories="Small"
                          color="Green"
                          onClick={() => handleApprove(conf.id!)}
                          disabled={isLoading}
                        >
                          Approve
                        </Button>
                        <div className="relative">
                          <details className="relative">
                            <summary className="text-xl list-none appearance-none cursor-pointer">&#8942;</summary>
                            <div className="absolute right-0 mt-2 w-32 bg-white border rounded shadow z-10">
                              <button
                                onClick={() => handleEdit(conf)}
                                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(conf.id!)}
                                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                              >
                                Delete
                              </button>
                            </div>
                          </details>
                        </div>
                      </div>
                    </div>
                  ))}
                {configurations.filter((conf) => conf.status === "pending").length === 0 && (
                  <div className="text-center py-8 text-gray-500">No pending configurations</div>
                )}
              </div>
            ) : (
              <div className="grid gap-4">
                {configurations.map((conf) => (
                  <div key={conf.id} className="flex items-center justify-between p-4 bg-white border rounded shadow">
                    <div className="flex items-center gap-4">
                      {conf.logoUrl && <img src={conf.logoUrl} alt="Logo" className="h-8 w-8 rounded" />}
                      <div>
                        <div className="font-medium">{conf.name}</div>
                        <div className="text-sm text-gray-600">
                          {conf.type} • {conf.status}
                        </div>
                      </div>
                    </div>
                    <div className="relative">
                      <details className="relative">
                        <summary className="text-xl list-none appearance-none cursor-pointer">&#8942;</summary>
                        <div className="absolute right-0 mt-2 w-32 bg-white border rounded shadow z-10">
                          <button
                            onClick={() => handleEdit(conf)}
                            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(conf.id!)}
                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </details>
                    </div>
                  </div>
                ))}
                {configurations.length === 0 && (
                  <div className="text-center py-8 text-gray-500">No configurations found</div>
                )}
              </div>
            )}
          </>
        )}

        {/* Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-4 border p-4 bg-gray-50 rounded">
            <h3 className="text-lg font-semibold mb-2 text-gray-800">
              {editId ? "Edit Configuration" : "Create New Configuration"}
            </h3>

            <div>
              <label className="block text-sm font-medium mb-1">Configuration Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border p-2 rounded"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Configuration Type</label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value as Configuration["type"] })
                }
                className="w-full border p-2 rounded"
                disabled={isLoading}
              >
                <option value="Hosted">Hosted</option>
                <option value="Whitelabel">Whitelabel</option>
              </select>
            </div>

            {formData.type === "Whitelabel" && (
              <div>
                <label className="block text-sm font-medium mb-1">Upload Logo (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                  disabled={isLoading}
                />
                {previewLogo && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 mb-1">Preview:</p>
                    <img src={previewLogo} alt="Logo Preview" className="h-16 w-auto rounded border" />
                  </div>
                )}
                {editId && !previewLogo && configurations.find(c => c.id === editId)?.logoUrl && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 mb-1">Current Logo:</p>
                    <img 
                      src={configurations.find(c => c.id === editId)?.logoUrl} 
                      alt="Current Logo" 
                      className="h-16 w-auto rounded border" 
                    />
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                color="Red"
                categories="Medium"
                onClick={resetForm}
                disabled={isLoading}
              >
                <span className="text-white">Cancel</span>
              </Button>
              <Button type="submit" color="Green" categories="Medium" disabled={isLoading}>
                <span className="text-white">
                  {isLoading ? "Processing..." : editId ? "Update" : "Submit"}
                </span>
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
    // </Layout>
  );
};

export default DeploymentMaster;