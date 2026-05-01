import axiosInstance from "@/api";
import { ENDPOINTS } from "@/api/endpoints";

export const storageService = {
  /**
   * Upload an asset to the storage.
   * Expects a File object.
   * Uses POST /storage/upload/asset?file
   */
  async uploadAsset(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);

    const { data } = await axiosInstance.post(ENDPOINTS.storageUploadAsset, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    // Handle different response formats
    // Usually { success, data: "https://url.com" } or { success, data: { url: "..." } }
    if (data.success) {
      return typeof data.data === 'string' ? data.data : data.data.url;
    }
    
    throw new Error(data.message || "Upload failed");
  },

  /**
   * Upload multiple assets.
   */
  async uploadMultipleAssets(files: FileList | File[]): Promise<string[]> {
    const uploadPromises = Array.from(files).map(file => this.uploadAsset(file));
    return Promise.all(uploadPromises);
  }
};
