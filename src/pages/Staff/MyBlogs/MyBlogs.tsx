import { useState } from "react";
import { BookOpen, Calendar, Eye, Edit, Trash2, Plus } from "lucide-react";
import StaffSidebar from "../../../components/staff/StaffSidebar";
import "../MySchedule/MySchedule.css";
import "./MyBlogs.css";

interface Blog {
    id: number;
    title: string;
    excerpt: string;
    createdAt: string;
    status: "published" | "draft";
    views: number;
}

// Mock data for staff blogs
const mockBlogs: Blog[] = [
    {
        id: 1,
        title: "10 Essential Skills Every Camper Should Learn",
        excerpt: "Discover the fundamental outdoor skills that will prepare young campers for success in any camping adventure...",
        createdAt: "2025-10-10",
        status: "published",
        views: 245,
    },
    {
        id: 2,
        title: "Creating Safe and Fun Camp Activities",
        excerpt: "Learn best practices for designing engaging activities that prioritize both safety and enjoyment...",
        createdAt: "2025-10-08",
        status: "published",
        views: 189,
    },
    {
        id: 3,
        title: "Building Team Spirit in Summer Camps",
        excerpt: "Effective strategies for fostering teamwork and camaraderie among diverse groups of campers...",
        createdAt: "2025-10-12",
        status: "draft",
        views: 0,
    },
    {
        id: 4,
        title: "Nature Education: Teaching Kids About Wildlife",
        excerpt: "Methods for introducing children to local flora and fauna in an engaging and educational way...",
        createdAt: "2025-10-05",
        status: "published",
        views: 312,
    },
];

export default function MyBlogs() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [filter, setFilter] = useState<"all" | "published" | "draft">("all");

    const filteredBlogs = filter === "all"
        ? mockBlogs
        : mockBlogs.filter(blog => blog.status === filter);

    const getStatusBadge = (status: Blog["status"]) => {
        return status === "published"
            ? <span className="blog-status published">Published</span>
            : <span className="blog-status draft">Draft</span>;
    };

    return (
        <div className="staff-layout">
            <StaffSidebar isCollapsed={isCollapsed} onToggleCollapse={() => setIsCollapsed(!isCollapsed)} />

            <div className={`main-content ${isCollapsed ? "sidebar-collapsed" : ""}`}>
                {/* Header */}
                <div className="page-header">
                    <div>
                        <h1 className="page-title">My Blogs</h1>
                        <p className="page-subtitle">Create and manage your blog posts</p>
                    </div>
                    <button className="create-blog-btn">
                        <Plus size={20} />
                        <span>Create New Blog</span>
                    </button>
                </div>

                {/* Filter Tabs */}
                <div className="filter-tabs">
                    <button
                        className={`filter-tab ${filter === "all" ? "active" : ""}`}
                        onClick={() => setFilter("all")}
                    >
                        All Posts
                    </button>
                    <button
                        className={`filter-tab ${filter === "published" ? "active" : ""}`}
                        onClick={() => setFilter("published")}
                    >
                        Published
                    </button>
                    <button
                        className={`filter-tab ${filter === "draft" ? "active" : ""}`}
                        onClick={() => setFilter("draft")}
                    >
                        Drafts
                    </button>
                </div>

                {/* Blogs List */}
                <div className="blogs-list">
                    {filteredBlogs.length > 0 ? (
                        filteredBlogs.map(blog => (
                            <div key={blog.id} className="blog-item">
                                <div className="blog-icon">
                                    <BookOpen size={24} />
                                </div>

                                <div className="blog-content">
                                    <div className="blog-header-row">
                                        <h3 className="blog-title">{blog.title}</h3>
                                        {getStatusBadge(blog.status)}
                                    </div>

                                    <p className="blog-excerpt">{blog.excerpt}</p>

                                    <div className="blog-meta">
                                        <div className="meta-item">
                                            <Calendar size={14} />
                                            <span>
                                                {new Date(blog.createdAt).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                        {blog.status === "published" && (
                                            <div className="meta-item">
                                                <Eye size={14} />
                                                <span>{blog.views} views</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="blog-actions">
                                    <button className="action-btn view-btn" title="View">
                                        <Eye size={18} />
                                    </button>
                                    <button className="action-btn edit-btn" title="Edit">
                                        <Edit size={18} />
                                    </button>
                                    <button className="action-btn delete-btn" title="Delete">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="no-blogs">
                            <BookOpen size={64} />
                            <p>No blog posts found</p>
                            <button className="create-blog-btn">
                                <Plus size={20} />
                                <span>Create Your First Blog</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
