"use client";

import { useState } from "react";
import Layout from "../../common/Layout";

// Import your master components
// import BICMaster from "./BICMaster";
import DeploymentMaster from "./DeploymentMaster";

const mastersList = [
  { label: "BIC Master", value: "bic" },
  { label: "Deployment Master", value: "deployment" },
];

const MastersPage = () => {
  const [selectedMaster, setSelectedMaster] = useState("");

  const renderSelectedComponent = () => {
    switch (selectedMaster) {
      // case "bic":
        // return <BICMaster />;
      case "deployment":
        return <DeploymentMaster />;
      default:
        return (
          <div className="flex justify-center items-center min-h-[60vh] text-gray-500">
            Please select a master from the dropdown above.
          </div>
        );
    }
  };

  return (
    <Layout title="Masters">
      <div className="flex flex-col items-center min-h-[80vh]">
        <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Master
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            value={selectedMaster}
            onChange={(e) => setSelectedMaster(e.target.value)}
          >
            <option value="">Select Master</option>
            {mastersList.map((master) => (
              <option key={master.value} value={master.value}>
                {master.label}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full px-4">{renderSelectedComponent()}</div>
      </div>
    </Layout>
  );
};

export default MastersPage;


