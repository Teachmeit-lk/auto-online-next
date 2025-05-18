import { useRouter } from "next/router";
import { FC } from "react";

interface ITab {
  label: string;
  content: React.ReactNode;
  path: string;
}

interface IVendorLayoutProps {
  activeTabIndex: number;
  tabs: ITab[];
}

export const VendorLayout: FC<IVendorLayoutProps> = ({
  activeTabIndex,
  tabs,
}) => {
  const router = useRouter();

  return (
    <div className="w-full py-10 px-12 bg-white " id="vendorlayout">
      {/* Tabs */}
      <div className="flex rounded-tl-[15px] overflow-hidden">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => router.push(tab.path)}
            className={`py-2 px-4 border border-b-1 border-white border-r-1 ${
              activeTabIndex === index
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
        {tabs[activeTabIndex]?.content || <p>No content available</p>}
      </div>
    </div>
  );
};
