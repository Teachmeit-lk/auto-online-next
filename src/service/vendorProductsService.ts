import apiClient from '@/config/api';

export interface Product {
  productId: number;
  name: string;
  brand?: string;
  model?: string;
  category?: string;
  year: number;
  countryOfManufacture?: string;
  vehicleType?: string;
  fuelType?: string;
  measurement: string;
  description: string;
  basePrice: number;
  quantity: number;
  imageUrl?: string;
  images?: Array<{
    imageId: number;
    imageUrl: string;
    imageName: string;
    isPrimary: boolean;
  }>;
  createdAt: Date;
}

export interface CreateProductDto {
  name: string;
  brandId?: number;
  modelId?: number;
  categoryId: number;
  year?: number;
  countryOfManufacture?: string;
  vehicleType?: string;
  fuelType?: string;
  measurement?: string;
  description: string;
  basePrice: number;
  quantity: number;
  imageUrl?: string;
}

export interface UpdateProductDto {
  name?: string;
  brandId?: number;
  modelId?: number;
  categoryId?: number;
  year?: number;
  countryOfManufacture?: string;
  vehicleType?: string;
  fuelType?: string;
  measurement?: string;
  description?: string;
  basePrice?: number;
  quantity?: number;
  imageUrl?: string;
}

export interface VendorProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface VendorProductsQuery {
  productId?: number;
  categoryId?: number;
  name?: string;
  brandId?: number;
  modelId?: number;
  year?: number;
  page?: number;
  limit?: number;
}

export interface Brand {
  brandId: number;
  name: string;
  country?: string;
}

export interface Category {
  categoryId: number;
  name: string;
}

export interface Model {
  modelId: number;
  name: string;
  brandId?: number;
}

export class VendorProductsService {
  // Get all brands
  static async getBrands(): Promise<Brand[]> {
    try {
      const response = await apiClient.get('/brand');
      return response.data.data;
    } catch (error: any) {
      console.error('Failed to fetch brands:', error);
      throw error;
    }
  }

  // Get all categories
  static async getCategories(): Promise<Category[]> {
    try {
      const response = await apiClient.get('/categories');
      return response.data.data;
    } catch (error: any) {
      console.error('Failed to fetch categories:', error);
      throw error;
    }
  }

  // Get all models
  static async getModels(brandId?: number): Promise<Model[]> {
    try {
      const params = brandId ? { brandId } : {};
      const response = await apiClient.get('/model', { params });
      return response.data.data;
    } catch (error: any) {
      console.error('Failed to fetch models:', error);
      throw error;
    }
  }

  // Get vendor products
  static async getProducts(query: VendorProductsQuery = {}): Promise<VendorProductsResponse> {
    try {
      const token = sessionStorage.getItem('accessToken');
      const response = await apiClient.get('/vendors/products', {
        params: query,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.data.data;
    } catch (error: any) {
      console.error('Failed to fetch vendor products:', error);
      throw error;
    }
  }

  // Get vendor gallery/product images  
  static async getGallery(query: { productId?: number; page?: number; limit?: number } = {}) {
    try {
      const token = sessionStorage.getItem('accessToken');
      const response = await apiClient.get('/vendors/gallery', {
        params: query,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.data.data;
    } catch (error: any) {
      console.error('Failed to fetch vendor gallery:', error);
      throw error;
    }
  }

  // Create a product
  static async createProduct(productData: CreateProductDto): Promise<any> {
    try {
      const token = sessionStorage.getItem('accessToken');
      const response = await apiClient.post('/products', productData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.data.data;
    } catch (error: any) {
      console.error('Failed to create product:', error);
      throw error;
    }
  }

  // Update a product  
  static async updateProduct(productId: number, productData: UpdateProductDto): Promise<any> {
    try {
      const token = sessionStorage.getItem('accessToken');
      const response = await apiClient.patch(`/products/${productId}`, productData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.data.data;
    } catch (error: any) {
      console.error('Failed to update product:', error);
      throw error;
    }
  }

  // Delete a product
  static async deleteProduct(productId: number): Promise<any> {
    try {
      const token = sessionStorage.getItem('accessToken');
      const response = await apiClient.delete(`/products/${productId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.data.data;
    } catch (error: any) {
      console.error('Failed to delete product:', error);
      throw error;
    }
  }

  // Get single product details
  static async getProduct(productId: number): Promise<Product> {
    try {
      const token = sessionStorage.getItem('accessToken');
      const response = await apiClient.get(`/products/${productId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.data.data;
    } catch (error: any) {
      console.error('Failed to fetch product:', error);
      throw error;
    }
  }
}
