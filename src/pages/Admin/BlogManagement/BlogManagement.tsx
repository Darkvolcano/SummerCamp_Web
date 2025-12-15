import { useState } from "react";
import { Search, Plus, Edit2, Eye, Calendar, User, FileText } from "lucide-react";
import { Spin } from "antd";
import BlogFormModal from "./BlogFormModal";
import BlogDetailModal from "./BlogDetailModal";
import {
  useBlogs,
  useDeleteBlogs,
  type BlogDto,
} from "../../../services/blogService";
import { useNotification } from "../../../contexts/NotificationContext";
import DeletePopover from "../../../components/DeletePopover";

export type BlogResponseDto = BlogDto;

export interface BlogRequestDto {
  title: string;
  content: string;
  imageUrl: string;
  authorId?: number;
}

export default function BlogManagement() {
  const { toastSuccess, toastError } = useNotification();
  const { data: blogs = [], isLoading: loading, refetch } = useBlogs();
  const deleteMutation = useDeleteBlogs();

  const [searchQuery, setSearchQuery] = useState("");
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<BlogDto | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [deletePopoverOpen, setDeletePopoverOpen] = useState<number | null>(null);

  const filteredBlogs = blogs.filter((blog) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        blog.title.toLowerCase().includes(query) ||
        blog.content.toLowerCase().includes(query) ||
        blog.authorName?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const handleCreate = () => {
    setSelectedBlog(null);
    setIsEditing(false);
    setIsFormModalOpen(true);
  };

  const handleEdit = (blog: BlogResponseDto) => {
    setSelectedBlog(blog);
    setIsEditing(true);
    setIsFormModalOpen(true);
  };

  const handleView = (blog: BlogResponseDto) => {
    setSelectedBlog(blog);
    setIsDetailModalOpen(true);
  };

  const handleDelete = async (blogId: number) => {
    try {
      await deleteMutation.mutateAsync(blogId);
      toastSuccess("Success", "Blog deleted successfully");
      refetch();
      setDeletePopoverOpen(null);
    } catch (error) {
      console.error("Error deleting blog:", error);
      toastError("Error", "Failed to delete blog");
    }
  };

  const handleFormSuccess = () => {
    setIsFormModalOpen(false);
    refetch();
  };

  const stats = {
    total: blogs.length,
    recent: blogs.filter((b) => {
      if (!b.createdAt) return false;
      try {
        const blogDate = new Date(b.createdAt);
        if (isNaN(blogDate.getTime())) return false;
        return blogDate.getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000;
      } catch {
        return false;
      }
    }).length,
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-6">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-[#111827]">Blog Management</h1>
        <p className="text-xs text-[#6B7280] mt-0.5">
          Manage and organize blog posts and articles
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-96">
          <Spin size="large" />
        </div>
      ) : blogs.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-12 text-center">
          <p className="text-[#6B7280] text-lg mb-4">No blog posts found</p>
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#6366F1] text-white rounded-lg hover:bg-[#4F46E5] transition-all font-medium text-sm"
          >
            <Plus size={16} />
            Create Blog Post
          </button>
        </div>
      ) : (
        <>
          {/* Filters and Table Section */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left Sidebar - Filters */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-6 sticky top-6">
                <h3 className="text-lg font-bold text-[#111827] mb-4">Filters</h3>

                {/* Search */}
                <div className="mb-6">
                  <label className="block text-xs font-semibold text-[#374151] mb-2 uppercase tracking-wider">
                    Search
                  </label>
                  <div className="relative">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
                      size={16}
                    />
                    <input
                      type="text"
                      placeholder="By title, content, author..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent text-sm text-[#6B7280] placeholder:text-[#9CA3AF]"
                    />
                  </div>
                </div>

                {/* Add Button */}
                <button
                  onClick={handleCreate}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#6366F1] text-white rounded-lg hover:bg-[#4F46E5] transition-all font-medium text-sm"
                >
                  <Plus size={16} />
                  Create Blog Post
                </button>

                {/* Summary Stats */}
                <div className="mt-6 pt-6 border-t border-[#E5E7EB]">
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs text-[#6B7280]">Total: </span>
                      <span className="text-lg font-bold text-[#111827]">
                        {stats.total}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-[#6B7280]">Found: </span>
                      <span className="text-lg font-bold text-[#6366F1]">
                        {filteredBlogs.length}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-[#6B7280]">Recent (7d): </span>
                      <span className="text-lg font-bold text-[#10B981]">
                        {stats.recent}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Main Section - Table */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] overflow-hidden">
                {/* Table Header */}
                <div className="px-6 py-4 border-b border-[#E5E7EB]">
                  <h2 className="text-lg font-bold text-[#111827]">
                    Found: {filteredBlogs.length}
                  </h2>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                          ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                          Title
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                          Author
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                          Created Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                          Preview
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E7EB]">
                      {filteredBlogs.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-6 py-12 text-center text-[#6B7280]"
                          >
                            No blog posts found matching your filters
                          </td>
                        </tr>
                      ) : (
                        filteredBlogs.map((blog, index) => (
                          <tr
                            key={blog.id}
                            className="hover:bg-[#F9FAFB] transition-colors"
                          >
                            <td className="px-6 py-4 text-sm font-mono text-[#6B7280]">
                              {index + 1}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <FileText size={16} className="text-[#6366F1]" />
                                <span className="text-sm font-medium text-[#111827] line-clamp-1">
                                  {blog.title}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                                <User size={16} />
                                {blog.authorName || `User ID: ${blog.authorId}`}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                                <Calendar size={16} />
                                {formatDate(blog.createdAt)}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-[#6B7280]">
                              <span className="line-clamp-2">
                                {blog.content.replace(/<[^>]*>/g, '').substring(0, 80)}...
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleView(blog)}
                                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#EFF6FF] text-[#3B82F6] rounded-lg hover:bg-[#DBEAFE] transition-all font-medium text-sm"
                                  title="View Details"
                                >
                                  <Eye size={16} />
                                  View
                                </button>
                                <button
                                  onClick={() => handleEdit(blog)}
                                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#F3F4F6] text-[#6B7280] rounded-lg hover:bg-[#E5E7EB] transition-all font-medium text-sm"
                                  title="Edit Blog"
                                >
                                  <Edit2 size={16} />
                                  Edit
                                </button>
                                <DeletePopover
                                  onConfirm={() => handleDelete(blog.id)}
                                  title="Delete Blog Post"
                                  message={`Are you sure you want to delete "${blog.title}"?`}
                                  buttonText="Delete"
                                  isOpen={deletePopoverOpen === blog.id}
                                  onOpenChange={(open) =>
                                    setDeletePopoverOpen(open ? blog.id : null)
                                  }
                                />
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modals */}
      {isFormModalOpen && (
        <BlogFormModal
          blog={selectedBlog}
          isEditing={isEditing}
          onClose={() => setIsFormModalOpen(false)}
          onSuccess={handleFormSuccess}
        />
      )}

      {isDetailModalOpen && selectedBlog && (
        <BlogDetailModal
          blog={selectedBlog}
          onClose={() => setIsDetailModalOpen(false)}
          onEdit={handleEdit}
          onDelete={(blog) => handleDelete(blog.id)}
        />
      )}
    </div>
  );
}
