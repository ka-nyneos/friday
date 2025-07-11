
'use client';

import Layout from "../../common/Layout";
import { useMemo, useState, useCallback, useEffect } from "react";
import PendingRequest from "./PendingRequest";
import AllExposureRequest from "./AllExposureRequest";
import AddExposure from "./AddExposure";

const useTabNavigation = (initialTab: string = 'existing') => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const switchTab = useCallback((tab: string) => {
    setActiveTab(tab);
  }, []);
  const isActiveTab = useCallback((tab: string) => {
    return activeTab === tab;
  }, [activeTab]);
  return {
    activeTab,
    switchTab,
    isActiveTab
  };
};

type BackendResponse = {
  payload: {
    showAllTab?: boolean;
    showForwardsTab?: boolean;
    showAddTab?: boolean;
  };
  pageToCall: string;
};

const ExposureUpload = () => {
  const { activeTab, switchTab, isActiveTab } = useTabNavigation('existing');

  const [visibleTabs, setVisibleTabs] = useState<{
    showAllTab: boolean;
    showForwardsTab: boolean;
    showAddTab: boolean;
  }>({
    showAllTab: false,
    showForwardsTab: false,
    showAddTab: false,
  });

  useEffect(() => {
    const fetchDataFromBackend = async () => {
      const mockData: BackendResponse = {
        payload: {
          showAllTab: true,
          showForwardsTab: true,
          showAddTab: true,

        },
        pageToCall: "ExposureUpload",
      };

      setVisibleTabs({
        showAllTab: mockData.payload.showAllTab ?? false,
        showForwardsTab: mockData.payload.showForwardsTab ?? false,
        showAddTab: mockData.payload.showAddTab ?? false,
      });
    };

    fetchDataFromBackend();
  }, []);

  const tabButtons = useMemo(() => {
    const tabConfig = [
      { id: 'existing', label: 'All Exposure Request', visible: visibleTabs.showAllTab },
      { id: 'forwards', label: 'Pending Exposure Request', visible: visibleTabs.showForwardsTab },
      { id: 'add', label: 'Add Exposure', visible: visibleTabs.showAddTab },
    ];

    return tabConfig
      .filter(tab => tab.visible)
      .map(tab => (
        <button
          key={tab.id}
          onClick={() => switchTab(tab.id)}
          className={`
            flex items-center space-x-2 px-6 py-3 text-sm font-medium rounded-t-lg border-b-2 transition-all duration-200
            ${isActiveTab(tab.id)
              ? "bg-primary-lt text-white border-primary shadow-sm"
            : "bg-body-hover text-secondary-text border-body-hover hover:bg-body-active hover:text-primary"
        }
          `}
        >
          <span>{tab.label}</span>
        </button>
      ));
  }, [visibleTabs, activeTab, switchTab, isActiveTab]);

  const currentContent = useMemo(() => {
    if (activeTab === 'existing' && visibleTabs.showAllTab) return <AllExposureRequest />;
    if (activeTab === 'forwards' && visibleTabs.showForwardsTab) return <PendingRequest />;
    if (activeTab === 'add' && visibleTabs.showAddTab) return <AddExposure />;
    return <div className="p-4 text-gray-600">This tab is not available.</div>;
  }, [activeTab, visibleTabs]);

  return (
    <Layout title="Exposure Upload & Approval Dashboard" showButton={false}>
      <div className="mb-6 pt-4">
        <div className="flex space-x-1 border-b border-gray-200">
          {tabButtons}
        </div>
      </div>

      <div className="transition-opacity duration-300">
        {currentContent}
      </div>
    </Layout>
  );
};

export default ExposureUpload;