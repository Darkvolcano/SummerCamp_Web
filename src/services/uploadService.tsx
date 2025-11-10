import axios, { AxiosError } from "axios";
import { CLOUDINARY_CONFIG } from "../config/cloudinary.config";

export interface UploadResponse {
  url: string;
  publicId: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
}

export interface UploadError {
  message: string;
  code?: string;
  statusCode?: number;
}

class UploadController {
  private abortControllers: Map<string, AbortController> = new Map();

  createController(id: string): AbortController {
    const controller = new AbortController();
    this.abortControllers.set(id, controller);
    return controller;
  }

  cancel(id: string): boolean {
    const controller = this.abortControllers.get(id);
    if (controller) {
      controller.abort();
      this.abortControllers.delete(id);
      return true;
    }
    return false;
  }

  clean(id: string): void {
    this.abortControllers.delete(id);
  }
}

export const uploadController = new UploadController();

/**
 * Upload Cloudinary (Unsigned)
 */
export const uploadImageToCloudinary = async (
  file: File,
  folder?: string,
  uploadId?: string,
  maxRetries: number = 3
): Promise<UploadResponse> => {
  const id = uploadId || `upload_${Date.now()}_${Math.random()}`;
  let lastError: UploadError = { message: "Unknown error" };

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const abortController = uploadController.createController(id);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", CLOUDINARY_CONFIG.uploadPreset);

      if (folder) {
        formData.append("folder", folder);
      }

      const response = await axios.post(CLOUDINARY_CONFIG.uploadUrl, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        signal: abortController.signal,
      });

      uploadController.clean(id);

      return {
        url: response.data.secure_url,
        publicId: response.data.public_id,
        format: response.data.format,
        width: response.data.width,
        height: response.data.height,
        bytes: response.data.bytes,
      };
    } catch (error) {
      if (axios.isCancel(error)) {
        uploadController.clean(id);
        throw new Error("Upload cancelled");
      }

      const axiosError = error as AxiosError;
      lastError = {
        message: axiosError.message || "Upload failed",
        code: axiosError.code,
        statusCode: axiosError.response?.status,
      };

      console.warn(
        `Upload attempt ${attempt}/${maxRetries} failed:`,
        lastError.message
      );

      if (
        axiosError.response?.status &&
        axiosError.response.status < 500 &&
        axiosError.response.status !== 408
      ) {
        uploadController.clean(id);
        throw new Error(lastError.message);
      }

      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt - 1) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  uploadController.clean(id);
  throw new Error(`Failed to upload image after ${maxRetries} attempts: ${lastError.message}`);
};

/**
 * Upload nhiều ảnh cùng lúc
 * @param files - Danh sách file ảnh
 * @param folder - Folder trên Cloudinary (optional)
 * @param maxRetries - Số lần retry khi upload thất bại (default: 3)
 * @returns Promise<UploadResponse[]>
 */
export const uploadMultipleImages = async (
  files: File[],
  folder?: string,
  maxRetries: number = 3
): Promise<UploadResponse[]> => {
  try {
    const uploadPromises = files.map((file, index) =>
      uploadImageToCloudinary(file, folder, `upload_batch_${index}`, maxRetries)
    );
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error("Error uploading multiple images:", error);
    throw new Error("Failed to upload images");
  }
};

/**
 * Xóa ảnh trên Cloudinary (Unsigned - CHỈ hoạt động nếu preset cho phép)
 * ⚠️ LƯU Ý: Thông thường unsigned preset KHÔNG cho phép xóa
 * Nên xóa từ backend hoặc dùng signed request
 * @param publicId - Public ID của ảnh cần xóa
 * @param maxRetries - Số lần retry khi xóa thất bại (default: 3)
 */
export const deleteImageFromCloudinary = async (
  publicId: string,
  maxRetries: number = 3
): Promise<void> => {
  if (!publicId || publicId.trim() === "") {
    throw new Error("Public ID is required");
  }

  let lastError: UploadError = { message: "Unknown error" };

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const formData = new FormData();
      formData.append("public_id", publicId);
      formData.append("upload_preset", CLOUDINARY_CONFIG.uploadPreset);

      await axios.post(CLOUDINARY_CONFIG.deleteUrl, formData);

      console.log("Image deleted successfully");
      return;
    } catch (error) {
      const axiosError = error as AxiosError;
      lastError = {
        message: axiosError.message || "Delete failed",
        code: axiosError.code,
        statusCode: axiosError.response?.status,
      };

      console.warn(
        `Delete attempt ${attempt}/${maxRetries} failed:`,
        lastError.message
      );

      if (
        axiosError.response?.status === 401 ||
        axiosError.response?.status === 403
      ) {
        throw new Error(
          "Unsigned preset does not allow deletion. Use backend with signed request."
        );
      }

      if (axiosError.response?.status === 404) {
        throw new Error("Image not found on Cloudinary");
      }

      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt - 1) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw new Error(
    `Failed to delete image after ${maxRetries} attempts: ${lastError.message}`
  );
};

/**
 * Validate file ảnh trước khi upload
 * @param file - File cần validate
 * @param maxSizeMB - Kích thước tối đa (MB)
 * @returns {valid: boolean, error?: string}
 */
export const validateImageFile = (
  file: File,
  maxSizeMB: number = 5
): { valid: boolean; error?: string } => {
  if (!file.name) {
    return { valid: false, error: "File không có tên" };
  }

  const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: "File phải là ảnh (JPEG, PNG, GIF, WebP)" };
  }

  const validExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
  const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
  if (!validExtensions.includes(fileExtension)) {
    return { valid: false, error: "Định dạng file không hợp lệ" };
  }

  const maxBytes = maxSizeMB * 1024 * 1024;
  if (file.size === 0) {
    return { valid: false, error: "File không được rỗng" };
  }

  if (file.size > maxBytes) {
    return { valid: false, error: `Ảnh không được vượt quá ${maxSizeMB}MB` };
  }

  return { valid: true };
};

/**
 * Get Cloudinary URL with transformations
 * @param publicId - Public ID của ảnh
 * @param transformations - Các transformation (width, height, crop, etc.)
 * @returns string - URL đã transform
 */
export const getTransformedImageUrl = (
  publicId: string,
  transformations?: {
    width?: number;
    height?: number;
    crop?: "fill" | "fit" | "scale" | "limit";
    quality?: number | "auto";
  }
): string => {
  const baseUrl = `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/upload`;

  if (!transformations) {
    return `${baseUrl}/${publicId}`;
  }

  const transforms: string[] = [];

  if (transformations.width) transforms.push(`w_${transformations.width}`);
  if (transformations.height) transforms.push(`h_${transformations.height}`);
  if (transformations.crop) transforms.push(`c_${transformations.crop}`);
  if (transformations.quality) transforms.push(`q_${transformations.quality}`);

  const transformString = transforms.join(",");
  return `${baseUrl}/${transformString}/${publicId}`;
};

export default {
  uploadImageToCloudinary,
  uploadMultipleImages,
  deleteImageFromCloudinary,
  validateImageFile,
  getTransformedImageUrl,
  uploadController,
};
