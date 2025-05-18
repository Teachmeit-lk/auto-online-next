export enum VendorTabs {
  // Profile = "Profile",
  Products = "Products",
  CompletedOrders = "Completed Orders",
  NewPriceRequests = "New Price Requests",
  NewPurchaseOrders = "New Purchase Orders",
  Gallery = "Gallery",
}

export enum CustomerTabs {
  SearchVendors = "Search Vendors",
  QuotationRequests = "Quotation Requests",
  QuotationsFromVendors = "Quotations From Vendors",
  AcceptedPOs = "Accepted POs",
  CompletedOrders = "Completed Orders",
}

export const VendorTabList = [
  // {
  //   label: VendorTabs.Profile,
  //   path: "/vendor/profile",
  // },
  {
    label: VendorTabs.Products,
    path: "/vendor/products",
  },
  {
    label: VendorTabs.CompletedOrders,
    path: "/vendor/completed-orders",
  },
  {
    label: VendorTabs.NewPriceRequests,
    path: "/vendor/new-price-requests",
  },
  {
    label: VendorTabs.NewPurchaseOrders,
    path: "/vendor/new-purchase-orders",
  },
  {
    label: VendorTabs.Gallery,
    path: "/vendor/gallery",
  },
];

export const CustomerTabList = [
  // {
  //   label: "Profile",
  //   path: "/user/profile",
  // },
  {
    label: CustomerTabs.SearchVendors,
    path: "/search-vendors",
  },
  {
    label: CustomerTabs.QuotationRequests,
    path: "/quotation-requests",
  },
  {
    label: CustomerTabs.QuotationsFromVendors,
    path: "/quotations-from-vendors",
  },
  {
    label: CustomerTabs.AcceptedPOs,
    path: "/accepted-po",
  },
  {
    label: CustomerTabs.CompletedOrders,
    path: "/completed-orders",
  },
];
