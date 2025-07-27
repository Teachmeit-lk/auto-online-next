import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
  getMetadata,
  updateMetadata,
} from "firebase/storage";
import { storage } from "@/config/firebase";

// Storage paths
export const STORAGE_PATHS = {
  PRODUCTS: "products",
  GALLERY: "gallery",
  PROFILES: "profiles",
  QUOTATIONS: "quotations",
  DOCUMENTS: "documents",
} as const;

export interface UploadProgress {
  progress: number;
  bytesTransferred: number;
  totalBytes: number;
}

export interface UploadResult {
  url: string;
  path: string;
  name: string;
  size: number;
  contentType: string;
}

export interface FileMetadata {
  name: string;
  fullPath: string;
  size: number;
  timeCreated: string;
  updated: string;
  contentType: string;
  downloadURL: string;
}

export class FirebaseStorageService {
  // Upload single file with progress tracking
  static async uploadFile(
    file: File,
    path: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    try {
      const fileName = `${Date.now()}_${file.name}`;
      const filePath = `${path}/${fileName}`;
      const storageRef = ref(storage, filePath);

      let uploadTask;
      
      if (onProgress) {
        uploadTask = uploadBytesResumable(storageRef, file);
        
        return new Promise((resolve, reject) => {
          uploadTask.on(
            "state_changed",
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              onProgress({
                progress,
                bytesTransferred: snapshot.bytesTransferred,
                totalBytes: snapshot.totalBytes,
              });
            },
            (error) => {
              console.error("Upload error:", error);
              reject(error);
            },
            async () => {
              try {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                resolve({
                  url: downloadURL,
                  path: filePath,
                  name: fileName,
                  size: file.size,
                  contentType: file.type,
                });
              } catch (error) {
                reject(error);
              }
            }
          );
        });
      } else {
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        
        return {
          url: downloadURL,
          path: filePath,
          name: fileName,
          size: file.size,
          contentType: file.type,
        };
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  }

  // Upload multiple files
  static async uploadMultipleFiles(
    files: File[],
    path: string,
    onProgress?: (fileIndex: number, progress: UploadProgress) => void
  ): Promise<UploadResult[]> {
    try {
      const uploadPromises = files.map((file, index) =>
        this.uploadFile(
          file,
          path,
          onProgress ? (progress) => onProgress(index, progress) : undefined
        )
      );

      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error("Error uploading multiple files:", error);
      throw error;
    }
  }

  // Upload product images
  static async uploadProductImages(
    vendorId: string,
    productId: string,
    images: File[],
    onProgress?: (fileIndex: number, progress: UploadProgress) => void
  ): Promise<UploadResult[]> {
    const path = `${STORAGE_PATHS.PRODUCTS}/${vendorId}/${productId}`;
    return this.uploadMultipleFiles(images, path, onProgress);
  }

  // Upload gallery images
  static async uploadGalleryImages(
    vendorId: string,
    images: File[],
    onProgress?: (fileIndex: number, progress: UploadProgress) => void
  ): Promise<UploadResult[]> {
    const path = `${STORAGE_PATHS.GALLERY}/${vendorId}`;
    return this.uploadMultipleFiles(images, path, onProgress);
  }

  // Upload profile image
  static async uploadProfileImage(
    userId: string,
    image: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    const path = `${STORAGE_PATHS.PROFILES}/${userId}`;
    return this.uploadFile(image, path, onProgress);
  }

  // Upload quotation request images
  static async uploadQuotationImages(
    buyerId: string,
    requestId: string,
    images: File[],
    onProgress?: (fileIndex: number, progress: UploadProgress) => void
  ): Promise<UploadResult[]> {
    const path = `${STORAGE_PATHS.QUOTATIONS}/${buyerId}/${requestId}`;
    return this.uploadMultipleFiles(images, path, onProgress);
  }

  // Upload documents (invoices, contracts, etc.)
  static async uploadDocument(
    userId: string,
    documentType: string,
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    const path = `${STORAGE_PATHS.DOCUMENTS}/${userId}/${documentType}`;
    return this.uploadFile(file, path, onProgress);
  }

  // Delete file
  static async deleteFile(filePath: string): Promise<void> {
    try {
      const fileRef = ref(storage, filePath);
      await deleteObject(fileRef);
    } catch (error) {
      console.error("Error deleting file:", error);
      throw error;
    }
  }

  // Delete multiple files
  static async deleteMultipleFiles(filePaths: string[]): Promise<void> {
    try {
      const deletePromises = filePaths.map(path => this.deleteFile(path));
      await Promise.all(deletePromises);
    } catch (error) {
      console.error("Error deleting multiple files:", error);
      throw error;
    }
  }

  // Get file metadata
  static async getFileMetadata(filePath: string): Promise<FileMetadata> {
    try {
      const fileRef = ref(storage, filePath);
      const metadata = await getMetadata(fileRef);
      const downloadURL = await getDownloadURL(fileRef);

      return {
        name: metadata.name,
        fullPath: metadata.fullPath,
        size: metadata.size,
        timeCreated: metadata.timeCreated,
        updated: metadata.updated,
        contentType: metadata.contentType || "",
        downloadURL,
      };
    } catch (error) {
      console.error("Error getting file metadata:", error);
      throw error;
    }
  }

  // List files in a directory
  static async listFiles(directoryPath: string): Promise<FileMetadata[]> {
    try {
      const directoryRef = ref(storage, directoryPath);
      const result = await listAll(directoryRef);

      const filePromises = result.items.map(async (itemRef) => {
        const metadata = await getMetadata(itemRef);
        const downloadURL = await getDownloadURL(itemRef);

        return {
          name: metadata.name,
          fullPath: metadata.fullPath,
          size: metadata.size,
          timeCreated: metadata.timeCreated,
          updated: metadata.updated,
          contentType: metadata.contentType || "",
          downloadURL,
        };
      });

      return await Promise.all(filePromises);
    } catch (error) {
      console.error("Error listing files:", error);
      throw error;
    }
  }

  // Get product images
  static async getProductImages(vendorId: string, productId: string): Promise<FileMetadata[]> {
    const path = `${STORAGE_PATHS.PRODUCTS}/${vendorId}/${productId}`;
    return this.listFiles(path);
  }

  // Get gallery images
  static async getGalleryImages(vendorId: string): Promise<FileMetadata[]> {
    const path = `${STORAGE_PATHS.GALLERY}/${vendorId}`;
    return this.listFiles(path);
  }

  // Update file metadata
  static async updateFileMetadata(
    filePath: string,
    metadata: { [key: string]: string }
  ): Promise<void> {
    try {
      const fileRef = ref(storage, filePath);
      await updateMetadata(fileRef, { customMetadata: metadata });
    } catch (error) {
      console.error("Error updating file metadata:", error);
      throw error;
    }
  }

  // Get download URL for existing file
  static async getDownloadURL(filePath: string): Promise<string> {
    try {
      const fileRef = ref(storage, filePath);
      return await getDownloadURL(fileRef);
    } catch (error) {
      console.error("Error getting download URL:", error);
      throw error;
    }
  }

  // Validate file type and size
  static validateFile(
    file: File,
    allowedTypes: string[] = ["image/jpeg", "image/jpg", "image/png", "image/gif"],
    maxSizeInMB: number = 5
  ): { isValid: boolean; error?: string } {
    // Check file type
    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `File type not allowed. Allowed types: ${allowedTypes.join(", ")}`,
      };
    }

    // Check file size
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      return {
        isValid: false,
        error: `File size too large. Maximum size: ${maxSizeInMB}MB`,
      };
    }

    return { isValid: true };
  }

  // Validate multiple files
  static validateFiles(
    files: File[],
    allowedTypes?: string[],
    maxSizeInMB?: number,
    maxFiles: number = 10
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check number of files
    if (files.length > maxFiles) {
      errors.push(`Too many files. Maximum allowed: ${maxFiles}`);
    }

    // Validate each file
    files.forEach((file, index) => {
      const validation = this.validateFile(file, allowedTypes, maxSizeInMB);
      if (!validation.isValid) {
        errors.push(`File ${index + 1}: ${validation.error}`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Generate unique filename
  static generateUniqueFileName(originalName: string, prefix?: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = originalName.split(".").pop();
    const nameWithoutExtension = originalName.replace(/\.[^/.]+$/, "");
    
    return prefix
      ? `${prefix}_${nameWithoutExtension}_${timestamp}_${randomString}.${extension}`
      : `${nameWithoutExtension}_${timestamp}_${randomString}.${extension}`;
  }

  // Compress image before upload (using canvas)
  static async compressImage(
    file: File,
    maxWidth: number = 1920,
    maxHeight: number = 1080,
    quality: number = 0.8
  ): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          file.type,
          quality
        );
      };

      img.src = URL.createObjectURL(file);
    });
  }
}