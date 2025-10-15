import { useState, useMemo } from "react";
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    Eye,
    Calendar,
    User,
    FileText,
    RefreshCw,
} from "lucide-react";
import AdminSidebar from "../../../components/admin/AdminSidebar";
import BlogFormModal from "./BlogFormModal";
import BlogDetailModal from "../BlogManagement/BlogDetailModal";
import { message } from "antd";
import { useBlogs, useDeleteBlogs, type BlogDto } from "../../../services/blogService";
import "./BlogManagement.css";

// Re-export BlogDto as BlogResponseDto for compatibility
export type BlogResponseDto = BlogDto;

export interface BlogRequestDto {
    title: string;
    content: string;
    image: string;
}

export default function BlogManagement() {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const handleToggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };

    // Use real API hooks
    const { data: blogs = [], isLoading: loading, refetch } = useBlogs();
    const deleteMutation = useDeleteBlogs();

    const [searchTerm, setSearchTerm] = useState("");

    // Modal states
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedBlog, setSelectedBlog] = useState<BlogDto | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    // Derive filtered blogs using useMemo to avoid infinite loops
    const filteredBlogs = useMemo(() => {
        if (!searchTerm) {
            return blogs;
        }

        return blogs.filter(
            (blog: BlogDto) =>
                blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                blog.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                blog.Author?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, blogs]);

    // Handle create
    const handleCreate = () => {
        setSelectedBlog(null);
        setIsEditing(false);
        setIsFormModalOpen(true);
    };

    // Handle edit
    const handleEdit = (blog: BlogResponseDto) => {
        setSelectedBlog(blog);
        setIsEditing(true);
        setIsFormModalOpen(true);
    };

    // Handle view
    const handleView = (blog: BlogResponseDto) => {
        setSelectedBlog(blog);
        setIsDetailModalOpen(true);
    };

    // Handle delete
    const handleDelete = async (blog: BlogDto) => {
        if (window.confirm(`Are you sure you want to delete "${blog.title}"?`)) {
            try {
                await deleteMutation.mutateAsync(blog.id);
                message.success("Blog deleted successfully");
                refetch();
            } catch (error) {
                console.error("Error deleting blog:", error);
                const errorMessage = error instanceof Error ? error.message : "Failed to delete blog";
                message.error(errorMessage);
            }
        }
    };

    // Handle form success
    const handleFormSuccess = () => {
        setIsFormModalOpen(false);
        refetch();
    };

    // Calculate stats
    const stats = {
        total: blogs.length,
        recent: blogs.filter(
            (b) =>
                new Date(b.createdAt).getTime() >
                Date.now() - 7 * 24 * 60 * 60 * 1000
        ).length,
    };

    return (
        <div className="blog-management-container">
            <AdminSidebar
                isCollapsed={isCollapsed}
                onToggleCollapse={handleToggleCollapse}
            />

            <main
                className={`blog-management-main ${isCollapsed ? "sidebar-collapsed" : ""
                    }`}
            >
                {/* Header */}
                <div className="blog-management-header">
                    <div className="header-left">
                        <h1 className="page-title">Blog Management</h1>
                        <p className="page-subtitle">Manage blog posts and articles</p>
                    </div>
                    <button className="btn-create" onClick={handleCreate}>
                        <Plus size={20} />
                        Create Blog Post
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon total">
                            <FileText size={24} />
                        </div>
                        <div className="stat-content">
                            <p className="stat-label">Total Posts</p>
                            <h3 className="stat-value">{stats.total}</h3>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon recent">
                            <Calendar size={24} />
                        </div>
                        <div className="stat-content">
                            <p className="stat-label">Recent (7 days)</p>
                            <h3 className="stat-value">{stats.recent}</h3>
                        </div>
                    </div>
                </div>

                {/* Filters Section */}
                <div className="filters-section">
                    <div className="search-box">
                        <Search size={20} />
                        <input
                            type="text"
                            placeholder="Search blogs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <button
                        className="btn-refresh"
                        onClick={() => refetch()}
                        disabled={loading}
                    >
                        <RefreshCw size={20} className={loading ? "spinning" : ""} />
                    </button>
                </div>

                {/* Table Container */}
                <div className="table-container">
                    {loading ? (
                        <div className="loading-state">
                            <RefreshCw size={48} className="spinning" />
                            <p>Loading blogs...</p>
                        </div>
                    ) : filteredBlogs.length === 0 ? (
                        <div className="empty-state">
                            <FileText size={64} />
                            <h3>No blogs found</h3>
                            <p>
                                {searchTerm
                                    ? "Try adjusting your search criteria"
                                    : "Click 'Create Blog Post' to add your first blog"}
                            </p>
                            {!searchTerm && (
                                <button className="btn-create" onClick={handleCreate}>
                                    <Plus size={20} />
                                    Create Blog Post
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            <table className="blogs-table">
                                <thead>
                                    <tr>
                                        <th>Title</th>
                                        <th>Author</th>
                                        <th>Created Date</th>
                                        <th>Preview</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredBlogs.map((blog) => (
                                        <tr key={blog.id}>
                                            <td>
                                                <div className="blog-title-cell">
                                                    <FileText size={20} />
                                                    <div>
                                                        <p className="blog-title">{blog.title}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="author-cell">
                                                    <User size={16} />
                                                    {blog.Author?.fullName || "Unknown Author"}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="date-cell">
                                                    <Calendar size={16} />
                                                    {new Date(blog.createdAt).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="preview-cell">
                                                {blog.content.substring(0, 60)}...
                                            </td>
                                            <td>
                                                <div className="actions-cell">
                                                    <button
                                                        className="action-btn view"
                                                        onClick={() => handleView(blog)}
                                                        title="View Details"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                    <button
                                                        className="action-btn edit"
                                                        onClick={() => handleEdit(blog)}
                                                        title="Edit"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        className="action-btn delete"
                                                        onClick={() => handleDelete(blog)}
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="results-footer">
                                Showing {filteredBlogs.length} of {blogs.length} blog posts
                            </div>
                        </>
                    )}
                </div>
            </main>

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
                    onDelete={handleDelete}
                />
            )}
        </div>
    );
}
