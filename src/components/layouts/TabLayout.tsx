"use client";

import { usePathname } from "next/navigation";
import { FC, ReactNode } from "react";

import { CustomerTabList, VendorTabList } from "@/config";
import Link from "next/link";

interface ITabLayoutProps {
  type: "vendor" | "user";
  children: ReactNode;
}

export const TabLayout: FC<ITabLayoutProps> = ({ children, type }) => {
  const pathname = usePathname();

  const tabs = type === "vendor" ? VendorTabList : CustomerTabList;

  const currentPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const currentTab = tabs.find((tab) => tab.path === currentPath);

  return (
    <div
      className="w-full py-10 px-4 md:px-10 lg:px-20 bg-white mx-auto"
      id="vendorlayout"
    >
      {/* Tabs */}
      <div className="flex rounded-tl-[15px] overflow-hidden ">
        {tabs.map((tab, index) => (
          <Link href={tab.path} key={index}>
            <button
              className={`py-2 px-1 sm:px-4 border border-b-1 border-white border-r-1 lg:text-[16px] md:text-[14px] text-[12px]   ${
                // activeTab === tab.label
                currentTab?.label === tab.label
                  ? "bg-[#F9C301] text-[#111102] font-body font-[500] "
                  : "text-[#111102] hover:text-[#F9C301] bg-[#F8F8F8]"
              } ${index === tabs.length - 1 ? "rounded-tr-[15px]" : ""}`}
            >
              {tab.label}
            </button>
          </Link>
        ))}
      </div>

      {/* Tab Content */}

      <div className="w-full bg-white ">{children}</div>
    </div>
  );
};
