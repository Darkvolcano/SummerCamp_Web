import { X, Edit2, Trash2 } from "lucide-react";
import { Modal } from "antd";
import type { BlogResponseDto } from "./BlogManagement";

interface BlogDetailModalProps {
  blog: BlogResponseDto;
  onClose: () => void;
  onEdit: (blog: BlogResponseDto) => void;
  onDelete: (blog: BlogResponseDto) => void;
}

export default function BlogDetailModal({
  blog,
  onClose,
  onEdit,
  onDelete,
}: BlogDetailModalProps) {
  const formatDate = (dateString: string | Date | null | undefined) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "N/A";
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  const getAuthorDisplay = () => {
    if (blog.authorName) {
      return blog.authorName;
    }
    return `User ID: ${blog.authorId}`;
  };

  return (
    <Modal
      open={true}
      onCancel={onClose}
      footer={null}
      width={900}
      centered
      closeIcon={<X size={20} />}
    >
      <div className="space-y-6">
        {/* Title */}
        <div className="border-b border-[#E5E7EB] pb-4">
          <h1 className="text-3xl font-bold text-[#111827] mb-3">
            {blog.title}
          </h1>
          <div className="flex items-center gap-4 text-sm text-[#6B7280]">
            <span>
              By <span className="font-medium text-[#111827]">{getAuthorDisplay()}</span>
            </span>
            <span>•</span>
            <span>{formatDate(blog.createdAt)}</span>
            <span>•</span>
            <span className="text-[#6366F1] font-medium">ID: #{blog.id}</span>
          </div>
        </div>

        {/* Featured Image */}
        {blog.imageUrl && (
          <div className="rounded-xl overflow-hidden border border-[#E5E7EB]">
            <img
              src={blog.imageUrl}
              alt={blog.title}
              className="w-full h-auto max-h-[500px] object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="prose prose-slate max-w-none">
          <div
            className="text-[#374151] leading-relaxed"
            dangerouslySetInnerHTML={{ __html: blog.content }}
            style={{
              fontSize: '16px',
              lineHeight: '1.75',
            }}
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5E7EB]">
          <button
            onClick={() => {
              onClose();
              onDelete(blog);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#FEF2F2] text-[#DC2626] rounded-lg hover:bg-[#FEE2E2] transition-all font-medium text-sm"
          >
            <Trash2 size={16} />
            Delete
          </button>
          <button
            onClick={() => {
              onClose();
              onEdit(blog);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#6366F1] text-white rounded-lg hover:bg-[#4F46E5] transition-all font-medium text-sm"
          >
            <Edit2 size={16} />
            Edit
          </button>
        </div>
      </div>
    </Modal>
  );
}
