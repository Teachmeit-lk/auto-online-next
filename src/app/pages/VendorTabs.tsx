import React from "react";

// import {
//   VendorProducts,
//   NewPriceRequests,
//   NewPurchaseOrders,
//   VendorGallery,
//   CompletedOrders,
// } from "@/components/vendor";
import { VendorLayout } from "@/app/layout/VendorLayout";

export const VendorTabs: React.FC = () => {
  const tabs = [
    { label: "Vendor Products", component: <>sample</> },
    { label: "Completed Orders", component: <>sample</> },
    { label: "New Price Requests", component: <>sample</> },
    { label: "New Purchase Orders", component: <>sample</> },
    { label: "Vendor Gallery", component: <>sample</> },
  ];

  return (
    <div className="container mx-auto" id="tabspage">
      <VendorLayout tabs={tabs} />
    </div>
  );
};
