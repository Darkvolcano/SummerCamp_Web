import React, { useState, useEffect } from 'react';
import { Spin, Modal, Empty } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Folder } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useNotification } from '../../../contexts/NotificationContext';
import albumService, { type AlbumResponseDto, type AlbumPhotoResponseDto } from '../../../services/albumService';
import campService, { type CampResponseDto } from '../../../services/campService';

const PhotoGallery: React.FC = () => {
  const navigate = useNavigate();
  const { campId } = useParams<{ campId: string }>();
  const { toastError } = useNotification();

  const [camp, setCamp] = useState<CampResponseDto | null>(null);
  const [albums, setAlbums] = useState<AlbumResponseDto[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedAlbum, setSelectedAlbum] = useState<AlbumResponseDto | null>(null);
  const [albumPhotos, setAlbumPhotos] = useState<AlbumPhotoResponseDto[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<AlbumPhotoResponseDto | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!campId) return;

      try {
        setLoading(true);
        const campIdNum = parseInt(campId);

        const campData = await campService.getCampById(campIdNum);
        setCamp(campData);

        const albumsData = await albumService.getAlbumsByCamp(campIdNum);
        setAlbums(albumsData);
      } catch (error: any) {
        console.error('Failed to load data:', error);
        const errorMessage = error.response?.data?.message || error.response?.data?.title || 'Không thể tải dữ liệu';
        toastError('Cảnh báo', errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [campId, toastError]);

  const handleOpenAlbum = async (album: AlbumResponseDto) => {
    try {
      setSelectedAlbum(album);
      setLoadingPhotos(true);
      const photos = await albumService.getPhotosByAlbum(album.albumId);
      setAlbumPhotos(photos);
    } catch (error: any) {
      console.error('Failed to load photos:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.title || 'Không thể tải ảnh';
      toastError('Cảnh báo', errorMessage);
    } finally {
      setLoadingPhotos(false);
    }
  };

  const handleCloseAlbum = () => {
    setSelectedAlbum(null);
    setAlbumPhotos([]);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-gray-600 font-medium">
            Đang tải kho ảnh...
          </p>
        </div>
      </div>
    );
  }

  if (selectedAlbum) {
    return (
      <div className="min-h-screen bg-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-8">
            <button
              onClick={handleCloseAlbum}
              className="flex bg-[#FF8F50] text-white items-center gap-2 hover:text-[#ffffff] font-semibold group px-6 py-2 rounded-full hover:shadow-lg hover:bg-[#ff7e3d] transition-all mb-6"
            >
              <ArrowLeftOutlined className="group-hover:-translate-x-1 transition-transform" />
              <span>Quay lại danh sách album</span>
            </button>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{selectedAlbum.title}</h1>
            <p className="text-gray-600 text-lg">
              {selectedAlbum.description || 'Không có mô tả'}
            </p>
          </div>

          {loadingPhotos ? (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <Spin size="large" />
                <p className="mt-4 text-gray-600 font-medium">Đang tải ảnh...</p>
              </div>
            </div>
          ) : albumPhotos.length === 0 ? (
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <Empty description="Chưa có ảnh trong album này" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {albumPhotos.map((photo) => (
                <div
                  key={photo.albumPhotoId}
                  className="relative group aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-[#FF8F50] hover:shadow-xl transition-all cursor-pointer"
                  onClick={() => setPreviewPhoto(photo)}
                >
                  <img
                    src={photo.photo}
                    alt={photo.caption || 'Photo'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {photo.caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white text-sm font-medium line-clamp-2">
                        {photo.caption}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <Modal
            open={!!previewPhoto}
            onCancel={() => setPreviewPhoto(null)}
            footer={null}
            width="90vw"
            style={{ maxWidth: '1200px' }}
            centered
          >
            {previewPhoto && (
              <div className="flex flex-col items-center">
                <img
                  src={previewPhoto.photo}
                  alt={previewPhoto.caption || 'Photo'}
                  className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
                />
                {previewPhoto.caption && (
                  <p className="mt-4 text-center text-gray-700 text-lg font-medium">
                    {previewPhoto.caption}
                  </p>
                )}
              </div>
            )}
          </Modal>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex bg-[#FF8F50] text-white items-center gap-2 hover:text-[#ffffff] font-semibold group px-6 py-2 rounded-full hover:shadow-lg hover:bg-[#ff7e3d] transition-all mb-6"
          >
            <ArrowLeftOutlined className="group-hover:-translate-x-1 transition-transform" />
            <span>Quay lại</span>
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Kho ảnh hội trại</h1>
          {camp && (
            <p className="text-gray-600 text-lg font-semibold">{camp.name}</p>
          )}
        </div>

        {albums.length === 0 ? (
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <Empty description="Chưa có album nào" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {albums.map((album) => (
              <button
                key={album.albumId}
                onClick={() => handleOpenAlbum(album)}
                className="group text-left outline-none focus:outline-none bg-transparent border-0 p-0"
              >
                <div className="aspect-square bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl flex flex-col items-center justify-center p-6 border-2 border-orange-200 hover:border-[#FF8F50] hover:shadow-xl transition-all">
                  <Folder size={64} className="text-[#FF8F50] mb-3 group-hover:scale-110 transition-transform" />
                  <div className="w-full">
                    <p className="text-sm font-bold text-gray-900 text-center truncate">
                      {album.title}
                    </p>
                    <p className="text-xs text-gray-600 text-center mt-1">
                      {album.photoCount || 0} ảnh
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoGallery;
