import { useState, useEffect } from "react";
import { X, Save, Upload } from "lucide-react";
import { Modal, Spin } from "antd";
import type { BlogResponseDto, BlogRequestDto } from "./BlogManagement";
import { useCreateBlogs, useUpdateBlogs, type CreateBlog } from "../../../services/blogService";
import { CKEditorComponent } from "../../../components/CKEditor/CKEditor";
import { useAuthStore } from "../../../services/userService";
import { useNotification } from "../../../contexts/NotificationContext";

interface BlogFormModalProps {
  blog: BlogResponseDto | null;
  isEditing: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BlogFormModal({
  blog,
  isEditing,
  onClose,
  onSuccess,
}: BlogFormModalProps) {
  const { toastSuccess, toastError } = useNotification();
  const createMutation = useCreateBlogs();
  const updateMutation = useUpdateBlogs();

  const [formData, setFormData] = useState<BlogRequestDto>({
    title: "",
    content: "",
    imageUrl: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (blog && isEditing) {
      setFormData({
        title: blog.title,
        content: blog.content,
        imageUrl: blog.imageUrl || "",
      });
      if (blog.imageUrl) {
        setImagePreview(blog.imageUrl);
      }
    }
  }, [blog, isEditing]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleContentChange = (value: string) => {
    setFormData((prev) => ({ ...prev, content: value }));
    if (errors.content) {
      setErrors((prev) => ({ ...prev, content: "" }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }

    if (errors.imageUrl) {
      setErrors((prev) => ({ ...prev, imageUrl: "" }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Tiêu đề là bắt buộc";
    } else if (formData.title.length < 5) {
      newErrors.title = "Tiêu đề phải có ít nhất 5 ký tự";
    }

    if (!formData.content.trim()) {
      newErrors.content = "Nội dung là bắt buộc";
    } else if (formData.content.length < 20) {
      newErrors.content = "Nội dung phải có ít nhất 20 ký tự";
    }

    if (!imageFile && !isEditing && !formData.imageUrl) {
      newErrors.imageUrl = "Hình ảnh là bắt buộc";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toastError("Lỗi xác thực", "Vui lòng sửa lỗi xác thực");
      return;
    }

    const { user } = useAuthStore.getState();
    if (!user || !user.id) {
      toastError("Lỗi xác thực", "Người dùng chưa xác thực. Vui lòng đăng nhập lại.");
      return;
    }

    try {
      setSaving(true);

      if (isEditing && blog) {
        if (!blog.id) {
          throw new Error("Blog ID is missing");
        }

        // For update, only include imageUrl if a new file is selected
        if (imageFile) {
          const blogDataWithImage: CreateBlog = {
            title: formData.title,
            content: formData.content,
            imageUrl: imageFile,
            authorId: user.id,
          };
          await updateMutation.mutateAsync({ id: blog.id, blog: blogDataWithImage });
        } else {
          // Create a dummy file or handle update without image
          // Since the API expects FormData, we need to send the existing imageUrl
          const blogDataWithoutNewImage: CreateBlog = {
            title: formData.title,
            content: formData.content,
            imageUrl: new File([], ""), // Empty file to satisfy type
            authorId: user.id,
          };
          await updateMutation.mutateAsync({ id: blog.id, blog: blogDataWithoutNewImage });
        }
        toastSuccess("Success", "Blog updated successfully");
      } else {
        // For create, imageFile is required
        if (!imageFile) {
          toastError("Validation Error", "Please select an image");
          return;
        }

        const blogDataWithAuthor: CreateBlog = {
          title: formData.title,
          content: formData.content,
          imageUrl: imageFile,
          authorId: user.id,
        };
        await createMutation.mutateAsync(blogDataWithAuthor);
        toastSuccess("Thành công", "Tạo blog thành công");
      }

      onSuccess();
    } catch (error) {
      console.error("Error saving blog:", error);
      const errorMessage = error instanceof Error ? error.message : "Không thể lưu blog";
      toastError("Lỗi", errorMessage);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={true}
      onCancel={onClose}
      footer={null}
      width={900}
      centered
      closeIcon={<X size={20} />}
      title={
        <h2 className="text-xl font-bold text-[#111827]">
          {isEditing ? "Chỉnh Sửa Bài Viết" : "Tạo Bài Viết"}
        </h2>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6 mt-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-[#374151] mb-2">
            Tiêu Đề <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Nhập tiêu đề blog"
            className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent text-sm ${errors.title ? "border-red-500" : "border-[#E5E7EB]"
              }`}
          />
          {errors.title && (
            <p className="text-red-500 text-xs mt-1">{errors.title}</p>
          )}
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-semibold text-[#374151] mb-2">
            Hình Ảnh Nổi Bật <span className="text-red-500">*</span>
          </label>

          {imagePreview && (
            <div className="mb-3 rounded-xl overflow-hidden border border-[#E5E7EB]">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-auto max-h-[300px] object-cover"
              />
            </div>
          )}

          <div className="flex items-center gap-3">
            <label className="flex-1 cursor-pointer">
              <div className={`flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-dashed rounded-lg transition-all ${errors.imageUrl
                  ? "border-red-500 bg-red-50"
                  : "border-[#E5E7EB] hover:border-[#6366F1] hover:bg-[#F9FAFB]"
                }`}>
                <Upload size={20} className="text-[#6B7280]" />
                <span className="text-sm text-[#6B7280]">
                  {imageFile ? imageFile.name : "Chọn tệp hình ảnh"}
                </span>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
          {errors.imageUrl && (
            <p className="text-red-500 text-xs mt-1">{errors.imageUrl}</p>
          )}
        </div>

        {/* Content */}
        <div>
          <CKEditorComponent
            name="content"
            label="Nội Dung"
            value={formData.content}
            onChange={handleContentChange}
            required={true}
          />
          {errors.content && (
            <p className="text-red-500 text-xs mt-1">{errors.content}</p>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5E7EB]">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#F3F4F6] text-[#6B7280] rounded-lg hover:bg-[#E5E7EB] transition-all font-medium text-sm disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#6366F1] text-white rounded-lg hover:bg-[#4F46E5] transition-all font-medium text-sm disabled:opacity-50"
          >
            {saving ? (
              <>
                <Spin size="small" />
                Đang lưu...
              </>
            ) : (
              <>
                <Save size={16} />
                {isEditing ? "Cập Nhật" : "Tạo"} Blog
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
