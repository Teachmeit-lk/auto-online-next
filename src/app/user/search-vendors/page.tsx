"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Search, ClipboardCheck } from "lucide-react";
import { TabLayout, ViewVendorProfileModal } from "@/components";

import { GetQuotationModal } from "@/components/";
import { SendWhatsAppConfirmationModal } from "@/components/user/SendWhatsAppConfirmationModal";
import { FirebaseStorageService } from "@/service/firebaseStorageService";
import { QuotationRequest } from "@/service/firestoreService";
import { buildWhatsAppQuotationUrl } from "@/components/hooks/openWhatsAppWithQuotation";

import {
  FirestoreService,
  COLLECTIONS,
  Category,
  VehicleBrand,
  VehicleModel,
  GalleryImage,
} from "@/service/firestoreService";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store/store";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { GetQuotationConfirmation } from "@/components/atoms/get-quotation-confirmation-modal";

const SearchVendors: React.FC = () => {
  const [entries, setEntries] = useState(10);
  const router = useRouter();
  const [getQuotationModalOpen, setGetQuotationModalOpen] = useState(false);
  const [ViewVendorProfileModalOpen, setViewVendorProfileModalOpen] =
    useState(false);
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [pendingVendor, setPendingVendor] = useState<any | null>(null);
  const [preFilledQuotationData, setPreFilledQuotationData] =
    useState<any>(null);
  const [isFromShopNow, setIsFromShopNow] = useState(false);
  const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("");
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [profileVendor, setProfileVendor] = useState<any | null>(null);
  const [quotationModalKey, setQuotationModalKey] = useState(0);

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

  const searchParams = useSearchParams();
  const initialSearch = (searchParams.get("search") || "").trim();
  const [search, setSearch] = useState<string>(initialSearch);
  const authState = useSelector((state: RootState) => state.auth as any);
  const [sentToVendors, setSentToVendors] = useState<Record<string, boolean>>(
    {}
  );
  const [isInitFromUrl, setIsInitFromUrl] = useState(true);
  const [hasUrlFilters, setHasUrlFilters] = useState(false);

  const filterKey = useMemo(
    () =>
      JSON.stringify({
        filterCategory,
        filterCountry,
        filterDistrict,
        search,
      }),
    [filterCategory, filterCountry, filterDistrict, search]
  );

  const resetNormalFlowState = () => {
    setSentToVendors({});
    setPendingVendor(null);
    setSelectedVendor(null);
    setProfileVendor(null);
    setSelectedVendorGallery([]);

    setConfirmationModalOpen(false);
    setGetQuotationModalOpen(false);
    setViewVendorProfileModalOpen(false);
    setWhatsAppModalOpen(false);
    setUploadedImageUrl("");

    setQuotationModalKey((k) => k + 1);
  };

  // useEffect(() => {
  //   if (isInitFromUrl) return;
  //   setSentToVendors({});
  //   setPendingVendor(null);
  //   setSelectedVendor(null);
  //   setConfirmationModalOpen(false);
  //   setWhatsAppModalOpen(false);
  //   setUploadedImageUrl("");
  // }, [filterKey, isInitFromUrl]);

  const clearAutoQuotationFlow = () => {
    setPreFilledQuotationData(null);
    setIsFromShopNow(false);
    setSentToVendors({});
    setPendingVendor(null);

    setConfirmationModalOpen(false);
    setWhatsAppModalOpen(false);
    setUploadedImageUrl("");
  };

  useEffect(() => {
    const categoryFromUrl = searchParams.get("category");
    const countryFromUrl = searchParams.get("filterCountry");
    const districtFromUrl = searchParams.get("filterDistrict");
    const fromShopNow = searchParams.get("fromShopNow");

    const anyFilters =
      !!categoryFromUrl ||
      !!countryFromUrl ||
      !!districtFromUrl ||
      fromShopNow === "true";

    setHasUrlFilters(anyFilters);

    if (categoryFromUrl) setFilterCategory(categoryFromUrl);
    if (countryFromUrl) setFilterCountry(countryFromUrl);
    if (districtFromUrl && fromShopNow !== "true")
      setFilterDistrict(districtFromUrl);

    setIsFromShopNow(fromShopNow === "true");

    setIsInitFromUrl(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const user = authState.user as any;

  const requestKey = useMemo(() => {
    if (!preFilledQuotationData) return "";

    const d = preFilledQuotationData;
    return JSON.stringify({
      country: d.country,
      brand: d.brand,
      model: d.model,
      category: d.category,
      district: d.district,
      vehicletype: d.vehicletype,
      manufactoringyear: d.manufactoringyear,
      fueltype: d.fueltype,
      measurement: d.measurement,
      noofunits: d.noofunits,
      description: d.description,

      imageCount: (d.imageDataArray || []).length,
    });
  }, [preFilledQuotationData]);

  useEffect(() => {
    setSentToVendors({});
  }, [requestKey]);

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

  useEffect(() => {
    if (isFromShopNow) {
      const storedData = sessionStorage.getItem("preFilledQuotationData");
      if (storedData) {
        setPreFilledQuotationData(JSON.parse(storedData));
        sessionStorage.removeItem("preFilledQuotationData");
      }
    }
  }, [isFromShopNow]);

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

  useEffect(() => {
    if (authState.isAuthenticated && !loading) {
      const pendingQuotation = localStorage.getItem("pendingQuotation");

      if (pendingQuotation) {
        try {
          const parsed = JSON.parse(pendingQuotation);

          setPreFilledQuotationData(parsed.quotationData);
          setIsFromShopNow(parsed.fromShopNow);

          if (parsed.returnUrl) {
            const urlParams = new URLSearchParams(
              parsed.returnUrl.split("?")[1]
            );
            const category = urlParams.get("category");
            const country = urlParams.get("filterCountry");

            if (category) setFilterCategory(category);
            if (country) setFilterCountry(country);
          }

          const vendor = vendors.find((v: any) => v.id === parsed.vendorId);

          if (vendor) {
            setPendingVendor(vendor);
            setSelectedVendor(vendor);

            setTimeout(() => {
              setConfirmationModalOpen(true);
            }, 500);
          } else if (parsed.vendorInfo) {
            const vendorInfo = {
              id: parsed.vendorId,
              ...parsed.vendorInfo,
            };
            setPendingVendor(vendorInfo);
            setSelectedVendor(vendorInfo);

            setTimeout(() => {
              setConfirmationModalOpen(true);
            }, 500);
          }

          localStorage.removeItem("pendingQuotation");
        } catch (error) {
          console.error("Error restoring pending quotation:", error);
          localStorage.removeItem("pendingQuotation");
        }
      }
    }
  }, [authState.isAuthenticated, vendors, loading]);

  const filtered = useMemo(() => {
    return vendors
      .filter((v) => {
        if (filterCategory !== "all") {
          const mc: string[] = (v.mainCategories || []) as string[];

          const matchedCategory = categories.find(
            (cat: any) =>
              cat.name === filterCategory || cat.id === filterCategory
          );

          const categoryId = matchedCategory?.id || filterCategory;
          const categoryName = matchedCategory?.name || filterCategory;

          const hasCategory = mc.some(
            (vendorCat) =>
              vendorCat === categoryId || vendorCat === categoryName
          );

          if (!hasCategory) return false;
        }
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
        if (filterDistrict !== "all" && v.district !== filterDistrict)
          return false;
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
    categories,
  ]);

  const handleAutoSubmitQuotation = async (vendor: any) => {
    if (!preFilledQuotationData || !user?.id) return;

    const data = preFilledQuotationData;
    console.log("Data:", preFilledQuotationData);

    let uploadedUrls: string[] = [];

    if (data.imageDataArray && data.imageDataArray.length > 0) {
      try {
        const uploadPromises = data.imageDataArray.map(
          async (imageData: any) => {
            const response = await fetch(imageData.data);
            const blob = await response.blob();
            const file = new File([blob], imageData.name, {
              type: imageData.type,
            });

            const compressed = file.type.startsWith("image/")
              ? await FirebaseStorageService.compressImage(
                  file,
                  1920,
                  1080,
                  0.7
                )
              : file;

            const requestId = `req_${Date.now()}_${Math.random()
              .toString(36)
              .substring(2, 9)}`;

            const res = await FirebaseStorageService.uploadDocument(
              user.id,
              `quotation/${requestId}`,
              compressed
            );

            return res.url;
          }
        );

        uploadedUrls = await Promise.all(uploadPromises);
        setUploadedImageUrl(uploadedUrls[0] || "");

        console.log("Images uploaded:", uploadedUrls);
      } catch (error) {
        console.error("Error uploading images:", error);
      }
    }

    const doc: Omit<QuotationRequest, "id" | "createdAt" | "updatedAt"> = {
      buyerId: user.id,
      buyerName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
      buyerEmail: user.email || "",
      buyerPhone: user.phone || "",
      vendorId: vendor?.id || null,
      vendorName: vendor?.firstName || null,
      country: data.country,
      brand: data.brand,
      model: data.model,
      category: data.category,
      district: data.district,
      vehicleType: data.vehicletype,
      manufacturingYear: data.manufactoringyear,
      fuelType: data.fueltype,
      measurement: data.measurement,
      numberOfUnits: data.noofunits,
      description: data.description,
      attachedImages: uploadedUrls.length > 0 ? uploadedUrls : [],
      status: "pending",
      quotationsReceived: 0,
      isActive: true,
    } as any;

    await FirestoreService.create<QuotationRequest>(
      COLLECTIONS.QUOTATION_REQUESTS,
      doc
    );

    setSentToVendors((prev) => ({ ...prev, [vendor.id]: true }));

    setWhatsAppModalOpen(true);
  };

  const handleConfirmWhatsApp = () => {
    if (!preFilledQuotationData || !selectedVendor || !user) return;

    const vendorPhone = selectedVendor?.whatsApp || selectedVendor?.phone || "";
    const vendorDisplayName =
      selectedVendor?.companyName ||
      `${selectedVendor?.firstName || ""} ${
        selectedVendor?.lastName || ""
      }`.trim() ||
      "Vendor";

    const waUrl = buildWhatsAppQuotationUrl({
      vendor: {
        id: selectedVendor?.id || "",
        name: vendorDisplayName,
      },
      vendorPhone,
      data: preFilledQuotationData,
      currentUser: user,
      fileUrl: uploadedImageUrl,
    });

    if (waUrl) {
      window.open(waUrl, "_blank");
    }

    setWhatsAppModalOpen(false);
  };

  const handleSkipWhatsApp = () => {
    setWhatsAppModalOpen(false);
  };

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
      const id = m.id || m.name;
      if (!id) return;

      map[id] = m.name;

      map[m.name] = m.name;
    });

    vendors.forEach((v: any) => {
      const vm: string[] = (v.vehicleModel || []) as string[];
      vm.forEach((val) => {
        if (val && !map[val]) {
          map[val] = val;
        }
      });
    });

    return map;
  }, [models, vendors]);

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
                onChange={(e) => {
                  const val = e.target.value;

                  if (!isInitFromUrl) {
                    if (isFromShopNow || preFilledQuotationData) {
                      clearAutoQuotationFlow();
                    }

                    // always reset normal mode "sent" + modals etc
                    resetNormalFlowState();
                  }

                  setFilterCategory(val);
                }}
              >
                <option value="all">All Categories</option>
                {categories.map((c: any) => (
                  <option key={(c as any).id || c.name} value={c.name}>
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
                onChange={(e) => {
                  const val = e.target.value;

                  if (!isInitFromUrl) {
                    if (isFromShopNow || preFilledQuotationData) {
                      clearAutoQuotationFlow();
                    }

                    resetNormalFlowState();
                  }

                  setFilterCountry(val);
                }}
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
                onChange={(e) => {
                  const val = e.target.value;

                  if (!isInitFromUrl) {
                    if (isFromShopNow || preFilledQuotationData) {
                      clearAutoQuotationFlow();
                    }

                    resetNormalFlowState();
                  }

                  setFilterDistrict(val);
                }}
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

            {/* Search bar temporarily removed based on client request. */}
            {/* Search */}
            {/* <div className="flex flex-col sm:col-span-2 lg:col-span-1">
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
            </div> */}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-tl-[10px] rounded-tr-[10px] ">
          <table className="w-full min-w-[660px] overflow-x-auto border-collapse sm:table hidden">
            <thead>
              <tr className="h-[36px] bg-[#D1D1D1] text-center text-[14px] font-body text-[#111102] font-[500] ">
                <th className="border border-r-2 border-b-2 border-white lg:px-[30px] py-2 ">
                  No.
                </th>
                <th className="border border-r-2 border-b-2  border-white lg:px-[60px] py-2">
                  Company Name
                </th>
                <th className=" border border-r-2 border-b-2 border-white lg:px-[140px] py-2">
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
                filtered.map((vendor, index) => {
                  const isDisabled = !!sentToVendors[vendor.id];
                  return (
                    <tr
                      key={index}
                      className="hover:bg-gray-50 bg-white text-[12px] text-[#111102] "
                    >
                      <td className="border border-r-2 border-b-2  border-[#F8F8F8] px-4 py-2 text-center">
                        {index + 1}
                      </td>
                      <td className="border border-r-2 border-b-2 border-[#F8F8F8] px-8 py-2 ">
                        {vendor?.companyName ||
                          (vendor?.firstName || "") +
                            " " +
                            (vendor?.lastName || "")}
                      </td>
                      <td className="border border-r-2 border-b-2 border-[#F8F8F8] px-8 py-2 ">
                        {vendor.address || "-"}
                      </td>
                      <td className="grid grid-cols-2 text-center w-full h-full">
                        <button
                          className={`bg-[#D1D1D1] border-r-2 border-white lg:px-3 lg:py-3 px-1 py-3 text-[#111102] text-[12px] w-full h-full
    ${
      isDisabled
        ? "opacity-50 cursor-not-allowed"
        : "hover:bg-yellow-500 active:bg-yellow-500"
    }`}
                          onClick={() => {
                            if (isDisabled) return;
                            if (!authState.isAuthenticated) {
                              if (isFromShopNow && preFilledQuotationData) {
                                localStorage.setItem(
                                  "pendingQuotation",
                                  JSON.stringify({
                                    quotationData: preFilledQuotationData,
                                    vendorId: vendor.id,
                                    vendorInfo: {
                                      firstName: vendor.firstName,
                                      lastName: vendor.lastName,
                                      companyName: vendor.companyName,
                                      whatsApp: vendor.whatsApp,
                                      phone: vendor.phone,
                                    },
                                    fromShopNow: true,
                                    returnUrl:
                                      window.location.pathname +
                                      window.location.search,
                                  })
                                );
                              }
                              router.push("/user/login");
                              return;
                            }

                            if (isFromShopNow && preFilledQuotationData) {
                              setPendingVendor(vendor);
                              setConfirmationModalOpen(true);
                            } else {
                              setSelectedVendor(vendor);
                              setGetQuotationModalOpen(true);
                            }
                          }}
                          disabled={isDisabled}
                        >
                          {isDisabled ? "Quotation Sent" : "Get Quotation"}
                        </button>
                        <button
                          className="bg-[#D1D1D1] lg:px-3 lg:py-3 px-1 py-3 text-[#111102] text-[12px] w-full h-full focus:hover:bg-yellow-500 hover:bg-yellow-500 active:bg-yellow-500"
                          onClick={async () => {
                            setProfileVendor(vendor);

                            const imgs =
                              await FirestoreService.getAll<GalleryImage>(
                                COLLECTIONS.GALLERY,
                                [
                                  {
                                    field: "vendorId",
                                    operator: "==",
                                    value: vendor.id,
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
                  );
                })
              )}
            </tbody>
          </table>

          <table className="w-full min-w-[660px] overflow-x-auto border-collapse table sm:hidden">
            <thead>
              <tr className="h-[36px] bg-[#D1D1D1] text-center text-[14px] font-body text-[#111102] font-[500] ">
                <th className="border border-r-2 border-b-2 border-white lg:px-[30px] py-2 ">
                  No.
                </th>
                <th className="border border-r-2 border-b-2  border-white lg:px-[60px] py-2">
                  Company Name
                </th>
                <th className="border px-4 py-2 border-b-1 border-white flex items-center justify-center space-x-2">
                  <ClipboardCheck size="19px" />
                  <span>Action</span>
                </th>
                <th className=" border border-r-2 border-b-2 border-white lg:px-[140px] py-2">
                  Address
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
                filtered.map((vendor, index) => {
                  const isDisabled = !!sentToVendors[vendor.id];
                  return (
                    <tr
                      key={index}
                      className="hover:bg-gray-50 bg-white text-[12px] text-[#111102] "
                    >
                      <td className="border border-r-2 border-b-2  border-[#F8F8F8] px-4 py-2 text-center">
                        {index + 1}
                      </td>
                      <td className="border border-r-2 border-b-2 border-[#F8F8F8] px-8 py-2 ">
                        {vendor?.companyName ||
                          (vendor?.firstName || "") +
                            " " +
                            (vendor?.lastName || "")}
                      </td>
                      <td className="grid grid-cols-2 text-center w-full h-full">
                        <button
                          className={`bg-[#D1D1D1] border-r-2 border-white lg:px-3 lg:py-3 px-1 py-3 text-[#111102] text-[12px] w-full h-full
    ${
      isDisabled
        ? "opacity-50 cursor-not-allowed"
        : "hover:bg-yellow-500 active:bg-yellow-500"
    }`}
                          onClick={() => {
                            if (isDisabled) return;
                            if (!authState.isAuthenticated) {
                              if (isFromShopNow && preFilledQuotationData) {
                                localStorage.setItem(
                                  "pendingQuotation",
                                  JSON.stringify({
                                    quotationData: preFilledQuotationData,
                                    vendorId: vendor.id,
                                    vendorInfo: {
                                      firstName: vendor.firstName,
                                      lastName: vendor.lastName,
                                      companyName: vendor.companyName,
                                      whatsApp: vendor.whatsApp,
                                      phone: vendor.phone,
                                    },
                                    fromShopNow: true,
                                    returnUrl:
                                      window.location.pathname +
                                      window.location.search,
                                  })
                                );
                              }
                              router.push("/user/login");
                              return;
                            }
                            if (isFromShopNow && preFilledQuotationData) {
                              setPendingVendor(vendor);
                              setConfirmationModalOpen(true);
                            } else {
                              setSelectedVendor(vendor);
                              setGetQuotationModalOpen(true);
                            }
                          }}
                          disabled={isDisabled}
                        >
                          {isDisabled ? "Quotation Sent" : "Get Quotation"}
                        </button>
                        <button
                          className="bg-[#D1D1D1] lg:px-3 lg:py-3 px-1 py-3 text-[#111102] text-[12px] w-full h-full focus:hover:bg-yellow-500 hover:bg-yellow-500 active:bg-yellow-500"
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
                      <td className="border border-r-2 border-b-2 border-[#F8F8F8] px-8 py-2 ">
                        {vendor.address || "-"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-4 text-[12px] text-[#5B5B5B] font-body">
          Showing 1-{entries} Entries
        </div>
      </div>
      <GetQuotationConfirmation
        isOpen={confirmationModalOpen}
        onConfirm={async () => {
          setConfirmationModalOpen(false);

          if (isFromShopNow && preFilledQuotationData) {
            setSelectedVendor(pendingVendor);
            await handleAutoSubmitQuotation(pendingVendor);
          } else {
            setSelectedVendor(pendingVendor);
            setGetQuotationModalOpen(true);
          }
        }}
        onClose={() => {
          setConfirmationModalOpen(false);
          setPendingVendor(null);
        }}
        vendorName={
          pendingVendor?.companyName ||
          `${pendingVendor?.firstName || ""} ${
            pendingVendor?.lastName || ""
          }`.trim()
        }
      />
      <GetQuotationModal
        isOpen={getQuotationModalOpen}
        onClose={() => setGetQuotationModalOpen(false)}
        vendor={selectedVendor}
        resetKey={filterKey}
        onSuccess={(vendorId) => {
          setSentToVendors((prev) => ({ ...prev, [vendorId]: true }));
        }}
      />
      <ViewVendorProfileModal
        isOpen={ViewVendorProfileModalOpen}
        onClose={() => setViewVendorProfileModalOpen(false)}
        vendor={profileVendor}
        gallery={selectedVendorGallery}
        categoryLabelMap={categoryLabelMap}
        brandLabelMap={brandLabelMap}
        modelLabelMap={modelLabelMap}
      />
      <SendWhatsAppConfirmationModal
        isOpen={whatsAppModalOpen}
        onConfirm={handleConfirmWhatsApp}
        onSkip={handleSkipWhatsApp}
        onClose={() => setWhatsAppModalOpen(false)}
        person="vendor"
      />
    </TabLayout>
  );
};

export default SearchVendors;
