"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/config/firebase";
import {
  Package,
  CarFront,
  Fuel,
  Tag,
  Building2,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import Image from "next/image";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store/store";

type Product = {
  id: string;
  partName?: string;
  description?: string;
  vehicleBrand?: string;
  vehicleModel?: string;
  condition?: string;
  fuelType?: string;
  mainCategory?: string;
  currency?: string;
  price?: number | string;
  [key: string]: any;
};

type Vendor = {
  id: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  address?: string;
  companyBR?: string;
  phone?: string;
  email?: string;
  [key: string]: any;
};

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const q = (searchParams.get("query") || "").trim();

  const authState = useSelector((state: RootState) => state.auth as any);
  const user = authState?.user as any | undefined;
  const isAdmin = user?.role === "admin" || user?.role === "vendor";
  const isNonAdmin = !!user && !isAdmin;

  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);

  useEffect(() => {
    if (!q) {
      setProducts([]);
      setVendors([]);
      return;
    }

    const runSearch = async () => {
      setLoading(true);
      try {
        const term = q.toLowerCase();

        const prodSnap = await getDocs(collection(db, "products"));
        const allProducts: Product[] = prodSnap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as any),
        }));

        const filteredProducts = allProducts.filter((p) =>
          Object.entries(p).some(
            ([key, value]) =>
              key !== "id" &&
              typeof value === "string" &&
              value.toLowerCase().includes(term)
          )
        );

        const vendorSnap = await getDocs(collection(db, "vendors"));
        const allVendors: Vendor[] = vendorSnap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as any),
        }));

        const filteredVendors = allVendors.filter((v) =>
          Object.entries(v).some(
            ([key, value]) =>
              key !== "id" &&
              typeof value === "string" &&
              value.toLowerCase().includes(term)
          )
        );

        setProducts(filteredProducts);
        setVendors(filteredVendors);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    };

    runSearch();
  }, [q]);

  const handleProductClick = () => {
    if (!isNonAdmin) return;
    router.push("/user/search-vendors");
  };

  const handleVendorClick = (name: string) => {
    if (!isNonAdmin) return;
    const searchValue = encodeURIComponent(name.trim());
    router.push(`/user/search-vendors?search=${searchValue}`);
  };

  if (!q) {
    return (
      <div className="max-w-6xl mx-auto py-12 px-4">
        <h1 className="text-2xl font-semibold mb-4">Search</h1>
        <p className="text-gray-600">
          Type something in the search bar to get started.
        </p>
      </div>
    );
  }

  const totalCount = products.length + vendors.length;

  return (
    <div className="max-w-6xl mx-auto sm:py-16 py-8 px-4 ">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-2xl md:text-3xl font-semibold">
          Search results for <span className="text-[#F9C301]">“{q}”</span>
        </h1>
        {!loading && (
          <p className="text-sm text-gray-500">
            {totalCount === 0
              ? "No matches found."
              : `${products.length} product${
                  products.length !== 1 ? "s" : ""
                } · ${vendors.length} vendor${vendors.length !== 1 ? "s" : ""}`}
          </p>
        )}
      </div>

      {loading && (
        <div className="flex justify-center items-center">
          <Image
            src={"/gear-spinner.svg"}
            alt="loading"
            width={120}
            height={120}
          />
        </div>
      )}

      {!loading && (
        <div className="space-y-10">
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-5 h-5 text-yellow-600" />
              <h2 className="text-xl font-semibold">Products</h2>
            </div>

            {products.length === 0 ? (
              <p className="text-gray-500 text-sm">No products found.</p>
            ) : (
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {products.map((p) => {
                  const title = p.partName || p.description || p.id;
                  return (
                    <li
                      key={p.id}
                      onClick={isNonAdmin ? handleProductClick : undefined}
                      className={`rounded-xl bg-[#F8F8F8] shadow-sm hover:shadow-md transition-shadow p-4 flex gap-3 ${
                        isNonAdmin ? "cursor-pointer" : ""
                      }`}
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-yellow-100">
                        <CarFront className="w-5 h-5 text-yellow-700" />
                      </div>

                      <div className="flex-1">
                        <div className="flex justify-between gap-2">
                          <h3 className="font-semibold text-gray-900 line-clamp-1">
                            {title}
                          </h3>
                          {p.currency && p.price && (
                            <span className="text-sm font-semibold text-yellow-700 whitespace-nowrap">
                              {p.currency} {p.price}
                            </span>
                          )}
                        </div>

                        {p.description && (
                          <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                            {p.description}
                          </p>
                        )}

                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-600">
                          {p.vehicleBrand && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100">
                              <CarFront className="w-3 h-3" />
                              {p.vehicleBrand}
                              {p.vehicleModel && ` • ${p.vehicleModel}`}
                            </span>
                          )}
                          {p.condition && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100">
                              <Tag className="w-3 h-3" />
                              {p.condition}
                            </span>
                          )}
                          {p.fuelType && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100">
                              <Fuel className="w-3 h-3" />
                              {p.fuelType}
                            </span>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section>
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-5 h-5 text-yellow-600" />
              <h2 className="text-xl font-semibold">Vendors</h2>
            </div>

            {vendors.length === 0 ? (
              <p className="text-gray-500 text-sm">No vendors found.</p>
            ) : (
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vendors.map((v) => {
                  const fullName =
                    [v.firstName, v.lastName].filter(Boolean).join(" ") ||
                    "Vendor";

                  return (
                    <li
                      key={v.id}
                      onClick={
                        isNonAdmin
                          ? () => handleVendorClick(fullName)
                          : undefined
                      }
                      className={`rounded-xl bg-[#F8F8F8] shadow-sm hover:shadow-md transition-shadow p-4 flex gap-3 ${
                        isNonAdmin ? "cursor-pointer" : ""
                      }`}
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-yellow-100">
                        <Building2 className="w-5 h-5 text-yellow-700" />
                      </div>

                      <div className="flex-1 space-y-1">
                        <h3 className="font-semibold text-gray-900 line-clamp-1">
                          {fullName}
                        </h3>
                        {v.companyBR && (
                          <p className="text-xs text-gray-500">
                            BR: {v.companyBR}
                          </p>
                        )}
                        {(v.city || v.address) && (
                          <p className="flex items-start gap-1 text-xs text-gray-600">
                            <MapPin className="w-3 h-3 mt-0.5" />
                            <span>
                              {v.address}
                              {v.city ? `, ${v.city}` : ""}
                            </span>
                          </p>
                        )}
                        <div className="flex flex-wrap gap-3 text-xs text-gray-600 mt-1">
                          {v.phone && (
                            <span className="inline-flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {v.phone}
                            </span>
                          )}
                          {v.email && (
                            <span className="inline-flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {v.email}
                            </span>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
