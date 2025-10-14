import { X, Edit2, Trash2, Calendar, User, FileText } from "lucide-react";
import type { BlogResponseDto } from "./BlogManagement";
import "./BlogDetailModal.css";

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
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-content blog-detail-modal"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="modal-header">
                    <div className="header-left">
                        <h2>{blog.title}</h2>
                    </div>
                    <button className="close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                {/* Detail Scroll */}
                <div className="detail-scroll">
                    {/* Quick Info Grid */}
                    <div className="quick-info-grid">
                        <div className="info-card">
                            <div className="info-icon author">
                                <User size={24} />
                            </div>
                            <div className="info-content">
                                <p className="info-label">Author</p>
                                <h4 className="info-value">{blog.Author?.fullName || "Unknown Author"}</h4>
                            </div>
                        </div>

                        <div className="info-card">
                            <div className="info-icon date">
                                <Calendar size={24} />
                            </div>
                            <div className="info-content">
                                <p className="info-label">Published</p>
                                <h4 className="info-value">{formatDate(new Date(blog.createdAt).toISOString())}</h4>
                            </div>
                        </div>

                        <div className="info-card">
                            <div className="info-icon id">
                                <FileText size={24} />
                            </div>
                            <div className="info-content">
                                <p className="info-label">Post ID</p>
                                <h4 className="info-value">#{blog.id}</h4>
                            </div>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="detail-section">
                        <h3 className="section-title">
                            <FileText size={20} />
                            Content
                        </h3>
                        <div
                            className="section-content ck-content"
                            dangerouslySetInnerHTML={{ __html: blog.content }}
                        />
                    </div>

                    {/* Additional Info */}
                    <div className="detail-section">
                        <h3 className="section-title">Additional Information</h3>
                        <div className="additional-info">
                            <div className="info-item">
                                <span className="info-key">Created At</span>
                                <span className="info-val">
                                    {new Date(blog.createdAt).toLocaleString()}
                                </span>
                            </div>
                            <div className="info-item">
                                <span className="info-key">Author ID</span>
                                <span className="info-val">{blog.authorId}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-key">Word Count</span>
                                <span className="info-val">
                                    {blog.content.split(/\s+/).length} words
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="modal-footer">
                    <button
                        className="btn-delete"
                        onClick={() => {
                            onClose();
                            onDelete(blog);
                        }}
                    >
                        <Trash2 size={20} />
                        Delete
                    </button>
                    <button
                        className="btn-edit"
                        onClick={() => {
                            onClose();
                            onEdit(blog);
                        }}
                    >
                        <Edit2 size={20} />
                        Edit
                    </button>
                </div>
            </div>
        </div>
    );
}
