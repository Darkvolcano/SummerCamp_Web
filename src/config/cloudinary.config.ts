export const CLOUDINARY_CONFIG = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "",
  uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "",
  apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY || "",
  uploadUrl: `https://api.cloudinary.com/v1_1/${
    import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  }/image/upload`,
  deleteUrl: `https://api.cloudinary.com/v1_1/${
    import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  }/image/destroy`,
};

// Validate config
if (!CLOUDINARY_CONFIG.cloudName) {
  console.error("Missing VITE_CLOUDINARY_CLOUD_NAME in environment variables");
}
if (!CLOUDINARY_CONFIG.uploadPreset) {
  console.error(
    "Missing VITE_CLOUDINARY_UPLOAD_PRESET in environment variables"
  );
}
