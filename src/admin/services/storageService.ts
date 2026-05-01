import axiosInstance, { publicAxios } from "@/api";
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

    if (data.success) {
      return typeof data.data === 'string' ? data.data : data.data.url;
    }
    
    throw new Error(data.message || "Upload failed");
  },

  /**
   * Upload a profile image to the storage.
   */
  async uploadProfile(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);

    const { data } = await publicAxios.post(ENDPOINTS.storageUploadProfile, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

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
