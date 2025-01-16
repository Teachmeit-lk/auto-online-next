"use client";

import React, { useState } from "react";

interface Tab {
  label: string;
  component: React.ReactNode;
}

interface TabLayoutProps {
  tabs: Tab[];
}

const VendorLayout: React.FC<TabLayoutProps> = ({ tabs }) => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="w-full py-10 px-12 bg-white " id="vendorlayout">
      {/* Tabs */}
      <div className="flex rounded-tl-[15px] overflow-hidden">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={`py-2 px-4 border border-b-1 border-white border-r-1 ${
              activeTab === index
                ? "bg-[#F9C301] text-[#111102] font-body font-[500] text-[16px]"
                : "text-[#111102] hover:text-[#F9C301] bg-[#F8F8F8]"
            } ${index === tabs.length - 1 ? "rounded-tr-[15px]" : ""}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}

      <div className="w-full bg-white ">
        {tabs[activeTab]?.component || <p>No content available</p>}
      </div>
    </div>
  );
};

export default VendorLayout;
