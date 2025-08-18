import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
  Timestamp,
  onSnapshot,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/config/firebase";

// Collection names
export const COLLECTIONS = {
  USERS: "users",
  BUYERS: "buyers",
  VENDORS: "vendors",
  PRODUCTS: "products",
  QUOTATION_REQUESTS: "quotationRequests",
  QUOTATIONS: "quotations",
  PURCHASE_ORDERS: "purchaseOrders",
  ORDERS: "orders",
  CATEGORIES: "categories",
  VEHICLE_BRANDS: "vehicleBrands",
  VEHICLE_MODELS: "vehicleModels",
  VEHICLE_TYPES: "vehicleTypes",
  FUEL_TYPES: "fuelTypes",
  GALLERY: "gallery",
  REVIEWS: "reviews",
  CHAT_ROOMS: "chatRooms",
  CHAT_MESSAGES: "chatMessages",
} as const;

// Base interfaces for common fields
export interface BaseDocument {
  id?: string;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
  isActive: boolean;
}

// Product interfaces
export interface Product extends BaseDocument {
  vendorId: string;
  partName: string;
  mainCategory: string;
  subCategory?: string;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleType: string;
  vehicleMadeIn: string;
  yearOfManufacturing: string;
  description: string;
  price?: number;
  currency?: string;
  stockQuantity?: number;
  images: string[];
  specifications?: Record<string, any>;
  condition: "new" | "used" | "refurbished";
  warranty?: string;
  tags: string[];
  views: number;
  isApproved: boolean;
}

// Quotation Request interfaces
export interface QuotationRequest extends BaseDocument {
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  vendorId?: string;
  vendorName?: string;
  country: string;
  model: string;
  district: string;
  vehicleType: string;
  manufacturingYear: string;
  fuelType: string;
  measurement: string;
  numberOfUnits: number;
  description: string;
  attachedImages: string[];
  status: "pending" | "received_quotes" | "completed" | "cancelled";
  quotationsReceived: number;
  targetDeliveryDate?: Date | Timestamp;
  maxBudget?: number;
}

// Quotation interfaces
export interface Quotation extends BaseDocument {
  quotationRequestId: string;
  vendorId: string;
  vendorName: string;
  vendorEmail: string;
  buyerId: string;
  products: Array<{
    productId?: string;
    partName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    description?: string;
    condition: "new" | "used" | "refurbished";
    warranty?: string;
  }>;
  totalAmount: number;
  currency: string;
  validUntil: Date | Timestamp;
  deliveryTimeframe: string;
  terms: string;
  status: "pending" | "accepted" | "rejected" | "expired";
  notes?: string;
}

// Purchase Order interfaces
export interface PurchaseOrder extends BaseDocument {
  quotationId: string;
  quotationRequestId: string;
  buyerId: string;
  vendorId: string;
  orderNumber: string;
  products: Array<{
    productId?: string;
    partName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  totalAmount: number;
  currency: string;
  deliveryAddress: {
    street: string;
    city: string;
    district: string;
    zipCode: string;
    country: string;
  };
  expectedDeliveryDate: Date | Timestamp;
  status: "pending" | "confirmed" | "in_progress" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "pending" | "paid" | "refunded";
  paymentMethod?: string;
  trackingNumber?: string;
  notes?: string;
}

// Order interfaces (completed orders)
export interface Order extends BaseDocument {
  purchaseOrderId: string;
  buyerId: string;
  vendorId: string;
  orderNumber: string;
  completedDate: Date | Timestamp;
  deliveredDate?: Date | Timestamp;
  rating?: number;
  review?: string;
  totalAmount: number;
  currency: string;
}

// Category interfaces
export interface Category extends BaseDocument {
  name: string;
  description?: string;
  parentCategoryId?: string;
  icon?: string;
  sortOrder: number;
}

// Vehicle Brand interfaces
export interface VehicleBrand extends BaseDocument {
  name: string;
  country: string;
  logo?: string;
  sortOrder: number;
}

// Vehicle Model interfaces
export interface VehicleModel extends BaseDocument {
  brandId: string;
  name: string;
  type: string;
  yearStart: number;
  yearEnd?: number;
  fuelTypes: string[];
}

// Gallery interfaces
export interface GalleryImage extends BaseDocument {
  vendorId: string;
  title: string;
  description?: string;
  imageUrl: string;
  category: string;
  tags: string[];
  storagePath?: string;
}

// Generic CRUD operations
export class FirestoreService {
  // Create document
  static async create<T extends BaseDocument>(
    collectionName: string,
    data: Omit<T, "id" | "createdAt" | "updatedAt">
  ): Promise<string> {
    try {
      const docData = {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, collectionName), docData);
      return docRef.id;
    } catch (error) {
      console.error(`Error creating document in ${collectionName}:`, error);
      throw error;
    }
  }

  // Create document with custom ID
  static async createWithId<T extends BaseDocument>(
    collectionName: string,
    docId: string,
    data: Omit<T, "id" | "createdAt" | "updatedAt">
  ): Promise<void> {
    try {
      const docData = {
        ...data,
        id: docId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(doc(db, collectionName, docId), docData);
    } catch (error) {
      console.error(`Error creating document with ID in ${collectionName}:`, error);
      throw error;
    }
  }

  // Get document by ID
  static async getById<T extends BaseDocument>(
    collectionName: string,
    docId: string
  ): Promise<T | null> {
    try {
      const docRef = doc(db, collectionName, docId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as T;
      }
      return null;
    } catch (error) {
      console.error(`Error getting document from ${collectionName}:`, error);
      throw error;
    }
  }

  // Update document
  static async update<T extends BaseDocument>(
    collectionName: string,
    docId: string,
    data: Partial<Omit<T, "id" | "createdAt">>
  ): Promise<void> {
    try {
      const updateData = {
        ...data,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(doc(db, collectionName, docId), updateData);
    } catch (error) {
      console.error(`Error updating document in ${collectionName}:`, error);
      throw error;
    }
  }

  // Delete document
  static async delete(collectionName: string, docId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, collectionName, docId));
    } catch (error) {
      console.error(`Error deleting document from ${collectionName}:`, error);
      throw error;
    }
  }

  // Get all documents with optional filters
  static async getAll<T extends BaseDocument>(
    collectionName: string,
    filters?: Array<{ field: string; operator: any; value: any }>,
    orderByField?: string,
    orderDirection: "asc" | "desc" = "desc",
    limitCount?: number
  ): Promise<T[]> {
    try {
      let q = collection(db, collectionName);
      let queryConstraints: any[] = [];

      // Apply filters
      if (filters) {
        filters.forEach(filter => {
          queryConstraints.push(where(filter.field, filter.operator, filter.value));
        });
      }

      // Apply ordering
      if (orderByField) {
        queryConstraints.push(orderBy(orderByField, orderDirection));
      }

      // Apply limit
      if (limitCount) {
        queryConstraints.push(limit(limitCount));
      }

      const querySnapshot = await getDocs(query(q, ...queryConstraints));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as T[];
    } catch (error) {
      console.error(`Error getting documents from ${collectionName}:`, error);
      throw error;
    }
  }

  // Real-time listener for collection
  static onCollectionChange<T extends BaseDocument>(
    collectionName: string,
    callback: (docs: T[]) => void,
    filters?: Array<{ field: string; operator: any; value: any }>,
    orderByField?: string,
    orderDirection: "asc" | "desc" = "desc"
  ) {
    try {
      let q = collection(db, collectionName);
      let queryConstraints: any[] = [];

      if (filters) {
        filters.forEach(filter => {
          queryConstraints.push(where(filter.field, filter.operator, filter.value));
        });
      }

      if (orderByField) {
        queryConstraints.push(orderBy(orderByField, orderDirection));
      }

      return onSnapshot(query(q, ...queryConstraints), snapshot => {
        const docs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as T[];
        callback(docs);
      });
    } catch (error) {
      console.error(`Error setting up listener for ${collectionName}:`, error);
      throw error;
    }
  }

  // Batch operations
  static async batchWrite(operations: Array<{
    type: "create" | "update" | "delete";
    collection: string;
    docId?: string;
    data?: any;
  }>): Promise<void> {
    try {
      const batch = writeBatch(db);

      operations.forEach(op => {
        const docRef = op.docId 
          ? doc(db, op.collection, op.docId)
          : doc(collection(db, op.collection));

        switch (op.type) {
          case "create":
            batch.set(docRef, {
              ...op.data,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
            break;
          case "update":
            batch.update(docRef, {
              ...op.data,
              updatedAt: serverTimestamp(),
            });
            break;
          case "delete":
            batch.delete(docRef);
            break;
        }
      });

      await batch.commit();
    } catch (error) {
      console.error("Error executing batch operations:", error);
      throw error;
    }
  }
}

// Specialized service functions for business logic
export class ProductService {
  static async createProduct(product: Omit<Product, "id" | "createdAt" | "updatedAt">): Promise<string> {
    return FirestoreService.create<Product>(COLLECTIONS.PRODUCTS, product);
  }

  static async getProductsByVendor(vendorId: string): Promise<Product[]> {
    // Avoid composite index requirements by not ordering server-side
    const list = await FirestoreService.getAll<Product>(
      COLLECTIONS.PRODUCTS,
      [{ field: "vendorId", operator: "==", value: vendorId }]
    );
    // Client-side sort by createdAt desc if timestamps are present
    return [...list].sort((a: any, b: any) => {
      const aTime = (a?.createdAt?.seconds || 0) * 1000 + (a?.createdAt?.nanoseconds || 0) / 1e6;
      const bTime = (b?.createdAt?.seconds || 0) * 1000 + (b?.createdAt?.nanoseconds || 0) / 1e6;
      return bTime - aTime;
    });
  }

  static async searchProducts(searchParams: {
    category?: string;
    vehicleBrand?: string;
    vehicleModel?: string;
    vehicleType?: string;
    condition?: string;
    maxPrice?: number;
    limit?: number;
  }): Promise<Product[]> {
    const filters: Array<{ field: string; operator: any; value: any }> = [
      { field: "isActive", operator: "==", value: true },
      { field: "isApproved", operator: "==", value: true },
    ];

    if (searchParams.category) {
      filters.push({ field: "mainCategory", operator: "==", value: searchParams.category });
    }
    if (searchParams.vehicleBrand) {
      filters.push({ field: "vehicleBrand", operator: "==", value: searchParams.vehicleBrand });
    }
    if (searchParams.vehicleModel) {
      filters.push({ field: "vehicleModel", operator: "==", value: searchParams.vehicleModel });
    }
    if (searchParams.vehicleType) {
      filters.push({ field: "vehicleType", operator: "==", value: searchParams.vehicleType });
    }
    if (searchParams.condition) {
      filters.push({ field: "condition", operator: "==", value: searchParams.condition });
    }
    if (searchParams.maxPrice) {
      filters.push({ field: "price", operator: "<=", value: searchParams.maxPrice });
    }

    return FirestoreService.getAll<Product>(
      COLLECTIONS.PRODUCTS,
      filters,
      "createdAt",
      "desc",
      searchParams.limit || 50
    );
  }
}

export class QuotationService {
  static async createQuotationRequest(request: Omit<QuotationRequest, "id" | "createdAt" | "updatedAt">): Promise<string> {
    return FirestoreService.create<QuotationRequest>(COLLECTIONS.QUOTATION_REQUESTS, request);
  }

  static async createQuotation(quotation: Omit<Quotation, "id" | "createdAt" | "updatedAt">): Promise<string> {
    const quotationId = await FirestoreService.create<Quotation>(COLLECTIONS.QUOTATIONS, quotation);
    
    // Update quotation request count
    const requestId = quotation.quotationRequestId;
    const request = await FirestoreService.getById<QuotationRequest>(COLLECTIONS.QUOTATION_REQUESTS, requestId);
    if (request) {
      await FirestoreService.update<QuotationRequest>(COLLECTIONS.QUOTATION_REQUESTS, requestId, {
        quotationsReceived: (request.quotationsReceived || 0) + 1,
        status: "received_quotes",
      });
    }

    return quotationId;
  }

  static async getQuotationsByBuyer(buyerId: string): Promise<Quotation[]> {
    return FirestoreService.getAll<Quotation>(
      COLLECTIONS.QUOTATIONS,
      [{ field: "buyerId", operator: "==", value: buyerId }],
      "createdAt",
      "desc"
    );
  }

  static async getQuotationsByVendor(vendorId: string): Promise<Quotation[]> {
    return FirestoreService.getAll<Quotation>(
      COLLECTIONS.QUOTATIONS,
      [{ field: "vendorId", operator: "==", value: vendorId }],
      "createdAt",
      "desc"
    );
  }
}

export class OrderService {
  static async createPurchaseOrder(order: Omit<PurchaseOrder, "id" | "createdAt" | "updatedAt">): Promise<string> {
    const orderId = await FirestoreService.create<PurchaseOrder>(COLLECTIONS.PURCHASE_ORDERS, order);
    
    // Update quotation status
    await FirestoreService.update<Quotation>(COLLECTIONS.QUOTATIONS, order.quotationId, {
      status: "accepted",
    });

    return orderId;
  }

  static async getPurchaseOrdersByBuyer(buyerId: string): Promise<PurchaseOrder[]> {
    return FirestoreService.getAll<PurchaseOrder>(
      COLLECTIONS.PURCHASE_ORDERS,
      [{ field: "buyerId", operator: "==", value: buyerId }],
      "createdAt",
      "desc"
    );
  }

  static async getPurchaseOrdersByVendor(vendorId: string): Promise<PurchaseOrder[]> {
    return FirestoreService.getAll<PurchaseOrder>(
      COLLECTIONS.PURCHASE_ORDERS,
      [{ field: "vendorId", operator: "==", value: vendorId }],
      "createdAt",
      "desc"
    );
  }

  static async completePurchaseOrder(purchaseOrderId: string, orderData: Partial<Order>): Promise<string> {
    // Create completed order
    const order: Omit<Order, "id" | "createdAt" | "updatedAt"> = {
      purchaseOrderId,
      ...orderData,
      completedDate: new Date(),
    } as Omit<Order, "id" | "createdAt" | "updatedAt">;

    const orderId = await FirestoreService.create<Order>(COLLECTIONS.ORDERS, order);

    // Update purchase order status
    await FirestoreService.update<PurchaseOrder>(COLLECTIONS.PURCHASE_ORDERS, purchaseOrderId, {
      status: "delivered",
    });

    return orderId;
  }
}