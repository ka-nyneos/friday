"use client";

import { useMemo, useState, useCallback} from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../common/Layout";
import AllRoles from "./AllRoles";
import AwaitingRoles from "./AwaitingRoles";



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
    label: "All Roles",
  },
  {
    id: "awaiting",
    label: "Awaiting Approval",
  }
];

const Roles = () => {
  const { activeTab, switchTab, isActiveTab } = useTabNavigation("all");

  const tabButtons = useMemo(() => {
    return TAB_CONFIG.map((tab) => (
      <button
        key={tab.id}
        onClick={() => switchTab(tab.id)}
        className={`
        flex items-center space-x-2 px-6 py-3 text-sm font-medium rounded-t-lg border-b transition-all duration-200
        ${
          isActiveTab(tab.id)
            ? "bg-primary-lt text-white border-primary shadow-sm"
            : "bg-body-hover text-secondary-text border-body-hover hover:bg-body-active hover:text-primary"
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
        return <AllRoles />;
      case "awaiting":
        return <AwaitingRoles />;
      default:
        return <AllRoles />;
    }
  }, [activeTab]);

  const navigate = useNavigate();
  const PageChange = () => {
    navigate("/role/create");
  };

  return (
    <>
      <Layout title="User Roles" showButton={true} buttonText="Create Role" onButtonClick={PageChange}>
        <div className="mb-6 pt-4">
          <div className="flex space-x-1 border-b-2 border-primary-lg">
            {tabButtons}
          </div>
        </div>

        <div className="transition-opacity duration-300">{currentContent}</div>
      </Layout>
    </>
  );
};

export default Roles;
