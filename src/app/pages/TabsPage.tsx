import React from "react";
import {
  SearchVendors,
  QuotationRequests,
  QuotationsFromVendors,
  AcceptedPO,
  CompletedOrders,
  VendorLayout,
} from "@/components/atoms/index";

const TabsPage: React.FC = () => {
  const tabs = [
    { label: "Search Vendors", component: <SearchVendors /> },
    { label: "Quotation Requests", component: <QuotationRequests /> },
    { label: "Quotations from Vendors", component: <QuotationsFromVendors /> },
    { label: "Accepted PO", component: <AcceptedPO /> },
    { label: "Completed Orders", component: <CompletedOrders /> },
  ];

  return (
    <div className="container mx-auto" id="tabspage">
      <VendorLayout tabs={tabs} />
    </div>
  );
};

export default TabsPage;
