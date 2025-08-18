"use client";

import React, { useEffect, useState } from "react";
import { Search, ClipboardCheck } from "lucide-react";
import {
  AddProductModal,
  DeleteItemConfirmation,
  TabLayout,
  ViewProductModal,
} from "@/components";
import withAuth from "@/components/authGuard/withAuth";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store/store";
import { ProductService, FirestoreService, COLLECTIONS, Product, Category, VehicleBrand, VehicleModel } from "@/service/firestoreService";

const VendorProducts: React.FC = () => {
  const [entries, setEntries] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpen2, setIsModalOpen2] = useState(false);
  const [isModalOpen3, setIsModalOpen3] = useState(false);
  const authState = useSelector((state: RootState) => state.auth as any);
  const currentUser = authState?.user;
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<VehicleBrand[]>([]);
  const [models, setModels] = useState<VehicleModel[]>([]);

  const loadProducts = async () => {
    if (!currentUser?.id) return;
    setLoading(true);
    try {
      const list = await ProductService.getProductsByVendor(currentUser.id);
      setProducts(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);

  useEffect(() => {
    (async () => {
      const [cats, brs, mds] = await Promise.all([
        FirestoreService.getAll<Category>(COLLECTIONS.CATEGORIES, undefined, "sortOrder", "asc"),
        FirestoreService.getAll<VehicleBrand>(COLLECTIONS.VEHICLE_BRANDS, undefined, "sortOrder", "asc"),
        FirestoreService.getAll<VehicleModel>(COLLECTIONS.VEHICLE_MODELS, undefined, "name", "asc"),
      ]);
      setCategories(cats);
      setBrands(brs);
      setModels(mds);
    })();
  }, []);

  const categoryLabelMap = React.useMemo(() => {
    const map: Record<string, string> = {};
    categories.forEach((c) => { if ((c as any).id) map[(c as any).id] = c.name; map[c.name] = c.name; });
    return map;
  }, [categories]);

  const brandLabelMap = React.useMemo(() => {
    const map: Record<string, string> = {};
    brands.forEach((b) => {
      const label = b.country ? `${b.name} - ${b.country}` : b.name;
      if ((b as any).id) map[(b as any).id] = label;
      map[b.name] = label;
    });
    return map;
  }, [brands]);

  const modelLabelMap = React.useMemo(() => {
    const map: Record<string, string> = {};
    models.forEach((m) => { if ((m as any).id) map[(m as any).id] = m.name; map[m.name] = m.name; });
    return map;
  }, [models]);

  // const handleConfirmAlert = () => {
  //   console.log("Table Row Deleted!");
  //   setIsModalOpen3(false);
  // };

  return (
    <TabLayout type="vendor">
      <div
        className="w-full p-8 bg-[#F8F8F8] rounded-tr-[15px] rounded-br-[15px] rounded-bl-[15px] "
        id="searchvendors"
      >
        <h1 className="text-[18px] font-bold font-body text-center text-[#111102] mb-6">
          Vendor Products
        </h1>
        <div className="flex items-center justify-between mb-4">
          {/* Show Entries Dropdown */}
          <div className="flex flex-col ">
            <div>
              <label className="font-body font-[500] text-[14px] text-[#111102]">
                Show
              </label>
            </div>

            <select
              className="rounded-[5px] px-3 text-[12px] font-body text-gray-600  w-[131px] h-[28px] focus:ring-2 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
              onChange={(e) => setEntries(Number(e.target.value))}
              defaultValue="10"
            >
              <option value="10">10 Entries</option>
              <option value="20">20 Entries</option>
              <option value="50">50 Entries</option>
            </select>
          </div>

          {/* Filters and Search */}
          <div className="flex items-center space-x-4">
            {/* Search Input Container */}
            <div className="relative w-[263px]">
              {/* Search Label */}
              <label
                htmlFor="search"
                className="font-body font-[500] text-[14px] text-[#111102] block mb-1"
              >
                Search
              </label>
              <input
                id="search"
                type="text"
                placeholder="Search"
                className="w-full h-[28px] pl-3 pr-8 rounded-[5px] font-body text-[12px] text-gray-600 outline-none focus:ring-2 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {/* Search Icon */}
              <div className="absolute right-2 top-[73%] transform -translate-y-1/2">
                <Search
                  strokeWidth="2px"
                  color="#5B5B5B"
                  size="17px"
                  className="text-gray-600"
                />
              </div>
            </div>
            {/* Add Now Button */}
            <button
              className="px-4 py-1 w-[89px] h-[28px]  mt-[25px] rounded-[5px] bg-[#F9C301] font-body text-[#111102] hover:bg-yellow-500 text-[12px] "
              onClick={() => setIsModalOpen(true)}
            >
              Add now
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-tl-[10px] rounded-tr-[10px]">
          <table className="w-full border-collapse ">
            <thead>
              <tr className="h-[36px] bg-[#D1D1D1] text-center text-[14px] font-body text-[#111102] font-[500] ">
                <th className="border border-r-2 border-b-2 border-white  py-2 px-1">
                  No.
                </th>
                <th className="border border-r-2 border-b-2  border-white  py-2">
                  Product Code
                </th>
                <th className="border border-r-2 border-b-2  border-white  py-2">
                  Name
                </th>
                <th className="border border-r-2 border-b-2  border-white  py-2">
                  Main Category
                </th>
                <th className="border border-r-2 border-b-2  border-white  py-2">
                  Brand
                </th>
                <th className="border border-r-2 border-b-2  border-white  py-2">
                  Model
                </th>

                <th className="border px-4 py-2 border-b-1 border-white flex items-center justify-center space-x-2">
                  <ClipboardCheck size="19px" />
                  <span>Action</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="px-4 py-3 text-left" colSpan={7}>Loading...</td></tr>
              ) : (
                products
                  .filter((p) => {
                    if (!search) return true;
                    const cat = categoryLabelMap[p.mainCategory] || p.mainCategory || "";
                    const br = brandLabelMap[p.vehicleBrand] || p.vehicleBrand || "";
                    const mdl = modelLabelMap[p.vehicleModel] || p.vehicleModel || "";
                    const q = search.toLowerCase();
                    return (
                      (p.partName || "").toLowerCase().includes(q) ||
                      cat.toLowerCase().includes(q) ||
                      br.toLowerCase().includes(q) ||
                      mdl.toLowerCase().includes(q)
                    );
                  })
                  .slice(0, entries)
                  .map((p, index) => (
                    <tr
                      key={(p as any).id || index}
                      className="hover:bg-gray-50 bg-white text-[12px] text-[#111102] "
                    >
                      <td className="border border-r-2 border-b-2  border-[#F8F8F8]   py-2 text-center">
                        {index + 1}
                      </td>
                      <td className="border border-r-2 border-b-2  border-[#F8F8F8] pl-7  py-2 ">
                        {(p as any).id || "-"}
                      </td>
                      <td className="border border-r-2 border-b-2 border-[#F8F8F8] pl-7  py-2 ">
                        {p.partName}
                      </td>
                      <td className="border border-r-2 border-b-2 border-[#F8F8F8] pl-7 py-2 ">
                        {categoryLabelMap[p.mainCategory] || p.mainCategory}
                      </td>
                      <td className="border border-r-2 border-b-2 border-[#F8F8F8] pl-7 py-2 ">
                        {brandLabelMap[p.vehicleBrand] || p.vehicleBrand}
                      </td>
                      <td className="border border-r-2 border-b-2 border-[#F8F8F8] pl-7 py-2 ">
                        {modelLabelMap[p.vehicleModel] || p.vehicleModel}
                      </td>
                      <td className="grid grid-cols-2 text-center w-full h-full">
                        <button
                          className="bg-[#D1D1D1] border-r-2 border-white  py-3  text-[#111102] text-[12px] w-full h-full focus:hover:bg-yellow-500 hover:bg-yellow-500 "
                          onClick={() => setIsModalOpen2(true)}
                        >
                          View
                        </button>
                        <button
                          className="bg-[#D1D1D1]  py-3 text-[#111102] text-[12px] w-full h-full focus:hover:bg-yellow-500 hover:bg-yellow-500 "
                          onClick={() => { setSelectedProductId((p as any).id || null); setIsModalOpen3(true); }}
                        >
                          Delete
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
          Showing 1-{entries} of {products.length} Entries
        </div>

        <AddProductModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onCreated={async () => {
            await loadProducts();
          }}
        />

        <ViewProductModal
          isOpen={isModalOpen2}
          onClose={() => setIsModalOpen2(false)}
        />

        <DeleteItemConfirmation
          isOpen={isModalOpen3}
          onClose={() => setIsModalOpen3(false)}
          onConfirm={async () => {
            try {
              if (selectedProductId) {
                await FirestoreService.delete(COLLECTIONS.PRODUCTS, selectedProductId);
                await loadProducts();
              }
            } finally {
              setIsModalOpen3(false);
              setSelectedProductId(null);
            }
          }}
        />
      </div>
    </TabLayout>
  );
};
export default withAuth(VendorProducts);
