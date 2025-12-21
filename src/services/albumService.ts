import axiosInstance from "../config/axios";

// ==================== REQUEST DTOs ====================

export interface AlbumRequestDto {
  campId: number;
  title: string;
  description?: string | null;
  date?: string | null;
}

export interface AlbumPhotoRequestDto {
  albumId: number;
  photo: string;
  caption?: string | null;
}

export interface AlbumPhotoBulkUploadDto {
  albumId: number;
  photos: File[];
  caption?: string | null;
}

// ==================== RESPONSE DTOs ====================

export interface AlbumResponseDto {
  albumId: number;
  campId: number;
  date: string;
  title: string;
  description: string | null;
  campName: string;
  photoCount: number;
}

export interface AlbumPhotoResponseDto {
  albumPhotoId: number;
  albumId: number;
  photo: string;
  caption: string | null;
}

// ==================== SERVICE ====================

const albumService = {
  /**
   * GET /api/album
   * Get all albums
   */
  getAllAlbums: async (): Promise<AlbumResponseDto[]> => {
    console.log("[albumService] GET /album");
    const response = await axiosInstance.get("/album");
    return response.data;
  },

  /**
   * POST /api/album
   * Create a new album
   */
  createAlbum: async (data: AlbumRequestDto): Promise<AlbumResponseDto> => {
    console.log("[albumService] POST /album");
    const response = await axiosInstance.post("/album", data);
    return response.data;
  },

  /**
   * GET /api/album/{id}
   * Get album by ID
   */
  getAlbumById: async (id: number): Promise<AlbumResponseDto> => {
    console.log(`[albumService] GET /album/${id}`);
    const response = await axiosInstance.get(`/album/${id}`);
    return response.data;
  },

  /**
   * PUT /api/album/{id}
   * Update album
   */
  updateAlbum: async (id: number, data: AlbumRequestDto): Promise<AlbumResponseDto> => {
    console.log(`[albumService] PUT /album/${id}`);
    const response = await axiosInstance.put(`/album/${id}`, data);
    return response.data;
  },

  /**
   * DELETE /api/album/{id}
   * Delete album
   */
  deleteAlbum: async (id: number): Promise<void> => {
    console.log(`[albumService] DELETE /album/${id}`);
    await axiosInstance.delete(`/album/${id}`);
  },

  /**
   * GET /api/album/camp/{campId}
   * Get albums by camp
   */
  getAlbumsByCamp: async (campId: number): Promise<AlbumResponseDto[]> => {
    console.log(`[albumService] GET /album/camp/${campId}`);
    const response = await axiosInstance.get(`/album/camp/${campId}`);
    return response.data;
  },

  // ==================== ALBUM PHOTO ENDPOINTS ====================

  /**
   * POST /api/album-photo
   * Create a new album photo
   */
  createAlbumPhoto: async (data: AlbumPhotoRequestDto): Promise<AlbumPhotoResponseDto> => {
    console.log("[albumService] POST /album-photo");
    const response = await axiosInstance.post("/album-photo", data);
    return response.data;
  },

  /**
   * GET /api/album-photo/{id}
   * Get album photo by ID
   */
  getAlbumPhotoById: async (id: number): Promise<AlbumPhotoResponseDto> => {
    console.log(`[albumService] GET /album-photo/${id}`);
    const response = await axiosInstance.get(`/album-photo/${id}`);
    return response.data;
  },

  /**
   * PUT /api/album-photo/{id}
   * Update album photo
   */
  updateAlbumPhoto: async (id: number, data: AlbumPhotoRequestDto): Promise<AlbumPhotoResponseDto> => {
    console.log(`[albumService] PUT /album-photo/${id}`);
    const response = await axiosInstance.put(`/album-photo/${id}`, data);
    return response.data;
  },

  /**
   * DELETE /api/album-photo/{id}
   * Delete album photo
   */
  deleteAlbumPhoto: async (id: number): Promise<void> => {
    console.log(`[albumService] DELETE /album-photo/${id}`);
    await axiosInstance.delete(`/album-photo/${id}`);
  },

  /**
   * GET /api/album-photo/album/{albumId}
   * Get all photos in an album
   */
  getPhotosByAlbum: async (albumId: number): Promise<AlbumPhotoResponseDto[]> => {
    console.log(`[albumService] GET /album-photo/album/${albumId}`);
    const response = await axiosInstance.get(`/album-photo/album/${albumId}`);
    return response.data;
  },

  /**
   * POST /api/album-photo/bulk
   * Bulk upload photos to an album
   * Content-Type: multipart/form-data
   */
  bulkUploadPhotos: async (data: AlbumPhotoBulkUploadDto): Promise<AlbumPhotoResponseDto[]> => {
    console.log("[albumService] POST /album-photo/bulk");
    const formData = new FormData();
    
    formData.append("albumId", data.albumId.toString());
    
    // Append multiple photos
    data.photos.forEach((photo) => {
      formData.append("photos", photo);
    });
    
    if (data.caption) {
      formData.append("caption", data.caption);
    }

    const response = await axiosInstance.post("/album-photo/bulk", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
};

export default albumService;
