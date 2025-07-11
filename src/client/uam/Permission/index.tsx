"use client";

import { useMemo, useState, useCallback} from "react";
// import { useNavigate } from "react-router-dom";
import Layout from "../../common/Layout";
import AssignPermission from './AssignPermissions';
import AwaitingPermission from './AwaitingPermission';




const useTabNavigation = (initialTab: string = "all") => {
  const [activeTab, setActiveTab] = useState(initialTab);

  const switchTab = useCallback((tab: string) => {
    setActiveTab(tab);
  }, []);

  const isActiveTab = useCallback(
    (tab: string) => {
      return activeTab === tab;
    },
    [activeTab]
  );

  return {
    activeTab,
    switchTab,
    isActiveTab,
  };
};

const TAB_CONFIG = [
  {
    id: "all",
    label: "Assign Permissions",
  },
  {
    id: "Awaiting",
    label: "Awaiting Users",
  },
];

const Permission = () => {
  const { activeTab, switchTab, isActiveTab } = useTabNavigation("all");

  const tabButtons = useMemo(() => {
    return TAB_CONFIG.map((tab) => (
      <button
        key={tab.id}
        onClick={() => switchTab(tab.id)}
        className={`
        flex items-center space-x-2 px-6 py-3 text-sm font-medium rounded-t-lg border-b-2 transition-all duration-200
        ${
          isActiveTab(tab.id)
            ? "bg-[#129990] text-white border-[#129990] shadow-sm"
            : "bg-[#CFFFE2]/30 text-gray-600 border-[#CFFFE2]/30 hover:bg-[#CFFFE2]/50 hover:text-[#129990]"
        }
      `}
      >
        <span>{tab.label}</span>
      </button>
    ));
  }, [activeTab, switchTab, isActiveTab]);

  const currentContent = useMemo(() => {
    switch (activeTab) {
      case "all":
        return <AssignPermission />;
      case "Awaiting":
        return <AwaitingPermission />;
      default:
        return <AssignPermission />;
    }
  }, [activeTab]);

  

  return (
    <>
      <Layout title="Permissions">
        <div className="mb-6 pt-4">
          <div className="flex space-x-1 border-b border-gray-200">
            {tabButtons}
          </div>
        </div>

        <div className="transition-opacity duration-300">{currentContent}</div>
      </Layout>
    </>
  );
};

export default Permission;