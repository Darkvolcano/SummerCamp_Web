import React, { useState, useEffect } from 'react';
import { Spin, Modal, Form, Input, Upload, Button, Empty } from 'antd';
import { Folder, Plus, X, Upload as UploadIcon } from 'lucide-react';
import { useStaffContext } from '../../../hooks/useStaffContext';
import { useNotification } from '../../../contexts/NotificationContext';
import albumService, { type AlbumResponseDto, type AlbumPhotoResponseDto } from '../../../services/albumService';
import { uploadGenericImage } from '../../../services/uploadService';
import DeletePopover from '../../../components/DeletePopover';

const StaffPhotos: React.FC = () => {
  const { selectedCampId } = useStaffContext();
  const { toastError, toastSuccess } = useNotification();

  const [albums, setAlbums] = useState<AlbumResponseDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateAlbumModal, setShowCreateAlbumModal] = useState(false);
  const [createAlbumForm] = Form.useForm();
  const [creatingAlbum, setCreatingAlbum] = useState(false);

  // Album detail view
  const [selectedAlbum, setSelectedAlbum] = useState<AlbumResponseDto | null>(null);
  const [albumPhotos, setAlbumPhotos] = useState<AlbumPhotoResponseDto[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [photoCaption, setPhotoCaption] = useState('');
  const [previewPhoto, setPreviewPhoto] = useState<AlbumPhotoResponseDto | null>(null);

  // Fetch albums
  useEffect(() => {
    if (!selectedCampId) {
      setAlbums([]);
      return;
    }

    const fetchAlbums = async () => {
      try {
        setLoading(true);
        const data = await albumService.getAlbumsByCamp(selectedCampId);
        setAlbums(data);
      } catch (error: any) {
        console.error('Failed to load albums:', error);
        const errorMessage = error.response?.data?.message || error.response?.data?.title || 'Không thể tải album';
        toastError('Lỗi', errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchAlbums();
  }, [selectedCampId, toastError]);

  // Create album
  const handleCreateAlbum = async () => {
    try {
      const values = await createAlbumForm.validateFields();
      setCreatingAlbum(true);

      if (!selectedCampId) {
        toastError('Lỗi', 'Chưa chọn trại');
        return;
      }

      const today = new Date();
      const dateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

      const newAlbum = await albumService.createAlbum({
        campId: selectedCampId,
        title: values.title,
        description: values.description || null,
        date: dateString,
      });

      toastSuccess('Thành công', 'Đã tạo album mới');
      setAlbums((prev) => [...prev, newAlbum]);
      setShowCreateAlbumModal(false);
      createAlbumForm.resetFields();
    } catch (error: any) {
      console.error('Failed to create album:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.title || 'Không thể tạo album';
      toastError('Lỗi', errorMessage);
    } finally {
      setCreatingAlbum(false);
    }
  };

  // Open album
  const handleOpenAlbum = async (album: AlbumResponseDto) => {
    try {
      setSelectedAlbum(album);
      setLoadingPhotos(true);
      const photos = await albumService.getPhotosByAlbum(album.albumId);
      setAlbumPhotos(photos);
    } catch (error: any) {
      console.error('Failed to load photos:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.title || 'Không thể tải ảnh';
      toastError('Lỗi', errorMessage);
    } finally {
      setLoadingPhotos(false);
    }
  };

  // Close album view
  const handleCloseAlbum = () => {
    setSelectedAlbum(null);
    setAlbumPhotos([]);
    setSelectedFiles([]);
    setPhotoCaption('');
  };

  // Upload photos
  const handleUploadPhotos = async () => {
    if (selectedFiles.length === 0) {
      toastError('Lỗi', 'Vui lòng chọn ít nhất một ảnh');
      return;
    }

    if (!photoCaption.trim()) {
      toastError('Lỗi', 'Vui lòng nhập mô tả cho ảnh');
      return;
    }

    if (!selectedAlbum) return;

    try {
      setUploadingPhotos(true);

      // Upload each file
      for (const file of selectedFiles) {
        const uploadResult = await uploadGenericImage(file);
        await albumService.createAlbumPhoto({
          albumId: selectedAlbum.albumId,
          photo: uploadResult.url,
          caption: photoCaption,
        });
      }

      toastSuccess('Thành công', `Đã tải lên ${selectedFiles.length} ảnh`);
      
      // Refresh photos
      const updatedPhotos = await albumService.getPhotosByAlbum(selectedAlbum.albumId);
      setAlbumPhotos(updatedPhotos);
      setSelectedFiles([]);
      setPhotoCaption('');
    } catch (error: any) {
      console.error('Failed to upload photos:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.title || 'Không thể tải ảnh lên';
      toastError('Lỗi', errorMessage);
    } finally {
      setUploadingPhotos(false);
    }
  };

  // Delete photo
  const handleDeletePhoto = async (photoId: number) => {
    if (!selectedAlbum) return;

    try {
      await albumService.deleteAlbumPhoto(photoId);
      toastSuccess('Thành công', 'Đã xóa ảnh');
      
      // Refresh photos
      const updatedPhotos = await albumService.getPhotosByAlbum(selectedAlbum.albumId);
      setAlbumPhotos(updatedPhotos);
    } catch (error: any) {
      console.error('Failed to delete photo:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.title || 'Không thể xóa ảnh';
      toastError('Lỗi', errorMessage);
    }
  };

  // No camp selected
  if (!selectedCampId) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[500px]">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-indigo-200 p-12 rounded-2xl text-center shadow-lg max-w-md">
          <h3 className="text-xl font-bold text-indigo-900 mb-2">Chọn Trại</h3>
          <p className="text-indigo-700 text-base leading-relaxed">
            Vui lòng chọn một trại từ thanh bên trái để quản lý ảnh
          </p>
        </div>
      </div>
    );
  }

  // Album detail view
  if (selectedAlbum) {
    return (
      <div className="p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleCloseAlbum}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-[#111827]">{selectedAlbum.title}</h1>
              <p className="text-[#6B7280] text-sm mt-1">
                {selectedAlbum.description || 'Không có mô tả'}
              </p>
            </div>
          </div>

          {/* Upload button */}
          <Upload
            multiple
            accept="image/*"
            beforeUpload={(file) => {
              setSelectedFiles((prev) => [...prev, file]);
              return false;
            }}
            fileList={[]}
            showUploadList={false}
          >
            <Button type="primary" icon={<UploadIcon size={16} />}>
              Chọn Ảnh
            </Button>
          </Upload>
        </div>

        {/* Selected files preview */}
        {selectedFiles.length > 0 && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-blue-900">
                Đã chọn {selectedFiles.length} ảnh
              </p>
              <div className="flex gap-2">
                <Button
                  size="small"
                  onClick={() => {
                    setSelectedFiles([]);
                    setPhotoCaption('');
                  }}
                >
                  Hủy
                </Button>
                <Button
                  size="small"
                  type="primary"
                  loading={uploadingPhotos}
                  onClick={handleUploadPhotos}
                >
                  Tải Lên
                </Button>
              </div>
            </div>
            <div className="mb-3">
              <Input
                placeholder="Nhập mô tả cho ảnh"
                value={photoCaption}
                onChange={(e) => setPhotoCaption(e.target.value)}
                maxLength={200}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200"
                >
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => setSelectedFiles((prev) => prev.filter((_, i) => i !== index))}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Photos grid */}
        {loadingPhotos ? (
          <div className="flex justify-center items-center h-64">
            <Spin size="large" />
          </div>
        ) : albumPhotos.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Chưa có ảnh trong album này"
          />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {albumPhotos.map((photo) => (
              <div
                key={photo.albumPhotoId}
                className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-all cursor-pointer"
                onClick={() => setPreviewPhoto(photo)}
              >
                <img
                  src={photo.photo}
                  alt={photo.caption || 'Photo'}
                  className="w-full h-full object-cover"
                />
                <div 
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <DeletePopover
                    onConfirm={() => handleDeletePhoto(photo.albumPhotoId)}
                    title="Xóa Ảnh"
                    message="Bạn có chắc chắn muốn xóa ảnh này không?"
                    confirmText="Xóa"
                    cancelText="Hủy"
                    buttonText=""
                    showIcon={true}
                    buttonSize="small"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Photo Preview Modal */}
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
                className="w-full h-auto max-h-[80vh] object-contain"
              />
              {previewPhoto.caption && (
                <p className="mt-4 text-center text-gray-700 text-lg">
                  {previewPhoto.caption}
                </p>
              )}
            </div>
          )}
        </Modal>
      </div>
    );
  }

  // Albums grid view
  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Ảnh Trại</h1>
          <p className="text-[#6B7280] text-sm mt-1">
            Quản lý và chia sẻ ảnh hoạt động của trại
          </p>
        </div>

        <button
          onClick={() => setShowCreateAlbumModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium"
        >
          <Plus size={20} />
          Tạo Album Mới
        </button>
      </div>

      {/* Albums grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      ) : albums.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Chưa có album nào"
        />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {albums.map((album) => (
            <button
              key={album.albumId}
              onClick={() => handleOpenAlbum(album)}
              className="group text-left outline-none focus:outline-none bg-transparent border-0 p-0"
            >
              <div className="aspect-square bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl flex flex-col items-center justify-center p-6 border border-blue-200 hover:border-blue-400 hover:shadow-xl transition-all">
                <Folder size={64} className="text-blue-600 mb-3 group-hover:scale-110 transition-transform" />
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

      {/* Create Album Modal */}
      <Modal
        title="Tạo Album Mới"
        open={showCreateAlbumModal}
        onCancel={() => {
          setShowCreateAlbumModal(false);
          createAlbumForm.resetFields();
        }}
        onOk={handleCreateAlbum}
        confirmLoading={creatingAlbum}
        okText="Tạo Album"
        cancelText="Hủy"
      >
        <Form form={createAlbumForm} layout="vertical" className="mt-4">
          <Form.Item
            label="Tên Album"
            name="title"
            rules={[{ required: true, message: 'Vui lòng nhập tên album' }]}
          >
            <Input placeholder="VD: Ngày đầu tiên, Hoạt động ngoài trời..." />
          </Form.Item>

          <Form.Item
            label="Mô Tả"
            name="description"
          >
            <Input.TextArea
              rows={3}
              placeholder="Mô tả về album này..."
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default StaffPhotos;
