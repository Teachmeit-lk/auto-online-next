"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Search, ClipboardCheck } from "lucide-react";
import { TabLayout, ViewVendorProfileModal } from "@/components";

import { GetQuotationModal } from "@/components/";
import withAuth from "@/components/authGuard/withAuth";
import {
  FirestoreService,
  COLLECTIONS,
  Category,
  VehicleBrand,
  VehicleModel,
  GalleryImage,
} from "@/service/firestoreService";

const SearchVendors: React.FC = () => {
  const [entries, setEntries] = useState(10);
  const [getQuotationModalOpen, setGetQuotationModalOpen] = useState(false);
  const [ViewVendorProfileModalOpen, setViewVendorProfileModalOpen] =
    useState(false);
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<VehicleBrand[]>([]);
  const [models, setModels] = useState<VehicleModel[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterCountry, setFilterCountry] = useState<string>("all");
  const [filterDistrict, setFilterDistrict] = useState<string>("all");
  const [selectedVendor, setSelectedVendor] = useState<any | null>(null);
  const [selectedVendorGallery, setSelectedVendorGallery] = useState<
    GalleryImage[]
  >([]);

  const loadVendors = async () => {
    setLoading(true);
    try {
      const list = await FirestoreService.getAll<any>(COLLECTIONS.USERS, [
        { field: "role", operator: "==", value: "vendor" },
        { field: "isActive", operator: "==", value: true },
      ]);
      setVendors(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVendors();
    (async () => {
      const [cats, brs, mds] = await Promise.all([
        FirestoreService.getAll<Category>(
          COLLECTIONS.CATEGORIES,
          undefined,
          "sortOrder",
          "asc"
        ),
        FirestoreService.getAll<VehicleBrand>(
          COLLECTIONS.VEHICLE_BRANDS,
          undefined,
          "sortOrder",
          "asc"
        ),
        FirestoreService.getAll<VehicleModel>(
          COLLECTIONS.VEHICLE_MODELS,
          undefined,
          "name",
          "asc"
        ),
      ]);
      setCategories(cats);
      setBrands(brs);
      setModels(mds);
    })();
  }, []);

  const countryOptions = useMemo(() => {
    const set = new Set<string>();
    brands.forEach((b) => b.country && set.add(b.country));
    return Array.from(set.values());
  }, [brands]);

  const districtOptions = useMemo(() => {
    const set = new Set<string>();
    vendors.forEach((v) => v.district && set.add(v.district));
    return Array.from(set.values());
  }, [vendors]);

  const filtered = useMemo(() => {
    return vendors
      .filter((v) => {
        // main category filter
        if (filterCategory !== "all") {
          const mc: string[] = (v.mainCategories || []) as string[];
          if (!mc.includes(filterCategory)) return false;
        }
        // country filter via brand reference
        if (filterCountry !== "all") {
          const vendorBrandIds: string[] = (v.vehicleBrand || []) as string[];
          const hasCountry = vendorBrandIds.some((id) => {
            const b = brands.find(
              (br: any) => (br as any).id === id || br.name === id
            );
            return b?.country === filterCountry;
          });
          if (!hasCountry) return false;
        }
        // district filter
        if (filterDistrict !== "all" && v.district !== filterDistrict)
          return false;
        // search
        if (search) {
          const q = search.toLowerCase();
          const name = `${v.firstName || ""} ${v.lastName || ""}`.trim();
          const address = v.address || "";
          if (
            !name.toLowerCase().includes(q) &&
            !address.toLowerCase().includes(q)
          )
            return false;
        }
        return true;
      })
      .slice(0, entries);
  }, [
    vendors,
    entries,
    filterCategory,
    filterCountry,
    filterDistrict,
    brands,
    search,
  ]);

  const categoryLabelMap = useMemo(() => {
    const map: Record<string, string> = {};
    categories.forEach((c: any) => {
      if (c.id) map[c.id] = c.name;
      map[c.name] = c.name;
    });
    return map;
  }, [categories]);

  const brandLabelMap = useMemo(() => {
    const map: Record<string, string> = {};
    brands.forEach((b: any) => {
      const label = b.country ? `${b.name} - ${b.country}` : b.name;
      if (b.id) map[b.id] = label;
      map[b.name] = label;
    });
    return map;
  }, [brands]);

  const modelLabelMap = useMemo(() => {
    const map: Record<string, string> = {};
    models.forEach((m: any) => {
      if (m.id) map[m.id] = m.name;
      map[m.name] = m.name;
    });
    return map;
  }, [models]);

  return (
    <TabLayout type="user">
      <div
        className="w-full lg:p-8 md:p-6  p-4 bg-[#F8F8F8] rounded-tr-[15px] rounded-br-[15px] rounded-bl-[15px] "
        id="searchvendors"
      >
        <h1 className="text-[18px] font-bold font-body text-center text-[#111102] mb-6">
          Vendors List
        </h1>

        <div className="mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
            <div className="flex flex-col">
              <label className="font-body font-medium text-sm text-[#111102] mb-1">
                Main Category
              </label>
              <select
                className="h-[32px] rounded-[5px] px-3 text-sm font-body text-gray-700 w-full focus:ring-2 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map((c: any) => (
                  <option
                    key={(c as any).id || c.name}
                    value={(c as any).id || c.name}
                  >
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Country of Manufactured */}
            <div className="flex flex-col">
              <label className="font-body font-medium text-sm text-[#111102] mb-1">
                Country of Manufactured
              </label>
              <select
                className="h-[32px] rounded-[5px] px-3 text-sm font-body text-gray-700 w-full focus:ring-2 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                value={filterCountry}
                onChange={(e) => setFilterCountry(e.target.value)}
              >
                <option value="all">All Countries</option>
                {countryOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Vendor District */}
            <div className="flex flex-col">
              <label className="font-body font-medium text-sm text-[#111102] mb-1">
                Vendor District
              </label>
              <select
                className="h-[32px] rounded-[5px] px-3 text-sm font-body text-gray-700 w-full focus:ring-2 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                value={filterDistrict}
                onChange={(e) => setFilterDistrict(e.target.value)}
              >
                <option value="all">All Districts</option>
                {districtOptions.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Show (Entries) */}
            <div className="flex flex-col">
              <label className="font-body font-medium text-sm text-[#111102] mb-1">
                Show
              </label>
              <select
                className="h-[32px] rounded-[5px] px-3 text-sm font-body text-gray-700 w-full focus:ring-2 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                onChange={(e) => setEntries(Number(e.target.value))}
                defaultValue="10"
              >
                <option value="10">10 Entries</option>
                <option value="20">20 Entries</option>
                <option value="50">50 Entries</option>
              </select>
            </div>

            {/* Search */}
            <div className="flex flex-col sm:col-span-2 lg:col-span-1">
              <label className="font-body font-medium text-sm text-[#111102] mb-1">
                Search
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search"
                  className="h-[32px] w-full pl-3 pr-8 rounded-[5px] text-sm font-body text-gray-700 outline-none focus:ring-2 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <Search
                    strokeWidth="2px"
                    size="18px"
                    className="text-gray-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-tl-[10px] rounded-tr-[10px]">
          <table className="w-full min-w-[660px] overflow-x-auto border-collapse ">
            <thead>
              <tr className="h-[36px] bg-[#D1D1D1] text-center text-[14px] font-body text-[#111102] font-[500] ">
                <th className="border border-r-2 border-b-2 border-white lg:px-[30px] py-2 ">
                  No.
                </th>
                <th className="border border-r-2 border-b-2  border-white lg:px-[60px] py-2">
                  Company Name
                </th>
                <th className="border border-r-2 border-b-2 border-white lg:px-[140px] py-2">
                  Address
                </th>
                <th className="border px-4 py-2 border-b-1 border-white flex items-center justify-center space-x-2">
                  <ClipboardCheck size="19px" />
                  <span>Action</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-4 py-3" colSpan={4}>
                    Loading...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td className="px-4 py-3" colSpan={4}>
                    No vendors found.
                  </td>
                </tr>
              ) : (
                filtered.map((vendor, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 bg-white text-[12px] text-[#111102] "
                  >
                    <td className="border border-r-2 border-b-2  border-[#F8F8F8] px-4 py-2 text-center">
                      {index + 1}
                    </td>
                    <td className="border border-r-2 border-b-2 border-[#F8F8F8] px-8 py-2 ">
                      {(vendor.firstName || "") + " " + (vendor.lastName || "")}
                    </td>
                    <td className="border border-r-2 border-b-2 border-[#F8F8F8] px-8 py-2 ">
                      {vendor.address || "-"}
                    </td>
                    <td className="grid grid-cols-2 text-center w-full h-full">
                      <button
                        className="bg-[#D1D1D1] border-r-2 border-white lg:px-3 lg:py-3 px-1 py-3  text-[#111102] text-[12px] w-full h-full focus:hover:bg-yellow-500 hover:bg-yellow-500 active:bg-yellow-500"
                        // onClick={() => setIsModalOpen1(true)}
                        onClick={() => {
                          setSelectedVendor(vendor);
                          setGetQuotationModalOpen(true);
                        }}
                      >
                        Get Quotation
                      </button>
                      <button
                        className="bg-[#D1D1D1] lg:px-3 lg:py-3 px-1 py-3 text-[#111102] text-[12px] w-full h-full focus:hover:bg-yellow-500 hover:bg-yellow-500 active:bg-yellow-500"
                        // onClick={() => setIsModalOpen2(true)}
                        onClick={async () => {
                          setSelectedVendor(vendor);
                          const imgs =
                            await FirestoreService.getAll<GalleryImage>(
                              COLLECTIONS.GALLERY,
                              [
                                {
                                  field: "vendorId",
                                  operator: "==",
                                  value: (vendor as any).id,
                                },
                              ]
                            );
                          setSelectedVendorGallery(imgs);
                          setViewVendorProfileModalOpen(true);
                        }}
                      >
                        View More
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-4 text-[12px] text-[#5B5B5B] font-body">
          Showing 1-{entries} Entries
        </div>

        {/* <FilterModal
        isOpen={isModalOpen1}
        onClose={() => setIsModalOpen1(false)}
      />

      <CompanyProfileModal
        isOpen={isModalOpen2}
        onClose={() => setIsModalOpen2(false)}
      /> */}
      </div>
      <GetQuotationModal
        isOpen={getQuotationModalOpen}
        onClose={() => setGetQuotationModalOpen(false)}
        vendor={
          selectedVendor
            ? {
                id: (selectedVendor as any).id,
                name: `${selectedVendor.firstName || ""} ${
                  selectedVendor.lastName || ""
                }`.trim(),
              }
            : null
        }
      />
      <ViewVendorProfileModal
        isOpen={ViewVendorProfileModalOpen}
        onClose={() => setViewVendorProfileModalOpen(false)}
        vendor={selectedVendor}
        gallery={selectedVendorGallery}
        categoryLabelMap={categoryLabelMap}
        brandLabelMap={brandLabelMap}
        modelLabelMap={modelLabelMap}
      />
    </TabLayout>
  );
};
export default withAuth(SearchVendors);
