"use client";

import { usePathname } from "next/navigation";
import { FC, ReactNode } from "react";

import { VendorTabList } from "@/config";
import Link from "next/link";

interface IVendorLayoutProps {
  children: ReactNode;
}

export const VendorLayout: FC<IVendorLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const currentPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const currentTab = VendorTabList.find((tab) => tab.path === currentPath);

  return (
    <div className="w-full py-10 px-12 bg-white " id="vendorlayout">
      {/* Tabs */}
      <div className="flex rounded-tl-[15px] overflow-hidden">
        {VendorTabList.map((tab, index) => (
          <Link href={tab.path} key={index}>
            <button
              className={`py-2 px-4 border border-b-1 border-white border-r-1 ${
                // activeTab === tab.label
                currentTab?.label === tab.label
                  ? "bg-[#F9C301] text-[#111102] font-body font-[500] text-[16px]"
                  : "text-[#111102] hover:text-[#F9C301] bg-[#F8F8F8]"
              } ${
                index === VendorTabList.length - 1 ? "rounded-tr-[15px]" : ""
              }`}
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
