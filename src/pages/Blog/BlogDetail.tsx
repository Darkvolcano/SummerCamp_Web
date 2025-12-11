import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Spin } from "antd";
import {
    CalendarOutlined,
    UserOutlined,
    ArrowLeftOutlined,
} from "@ant-design/icons";
import { useGetBlogById } from "../../services/blogService";
import "./BlogDetail.css";

const BlogDetail: React.FC = () => {
    const { blogId } = useParams<{ blogId: string }>();
    const navigate = useNavigate();
    const { data: blog, isLoading: loading } = useGetBlogById(parseInt(blogId || "0"));

    const formatDate = (dateString: Date) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    const formatDateTime = (dateString: Date) => {
        const date = new Date(dateString);
        return date.toLocaleString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-gray-50 to-white">
                <div className="text-center">
                    <Spin size="large" />
                    <p className="mt-4 text-gray-600 font-semibold">
                        Đang tải bài viết...
                    </p>
                </div>
            </div>
        );
    }

    if (!blog) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-b from-gray-50 to-white">
                <div className="text-6xl mb-4 animate-bounce">📝</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Không tìm thấy bài viết
                </h2>
                <p className="text-gray-600 mb-6">
                    Bài viết không tồn tại hoặc đã bị xóa
                </p>
                <button
                    onClick={() => navigate("/blog-posts")}
                    className="bg-[#FF8F50] text-white px-8 py-3 rounded-full hover:bg-[#ff7e3d] transition-all shadow-lg hover:shadow-xl hover:scale-105 font-semibold"
                >
                    ← Quay lại danh sách
                </button>
            </div>
        );
    }

    return (
        <div className="blog-detail-page bg-gradient-to-b from-gray-50 to-white min-h-screen">
            <div className="max-w-7xl mx-auto px-4 pt-24 pb-1">
                <button
                    onClick={() => navigate("/blog-posts")}
                    className="flex bg-[#FF8F50] text-white items-center gap-2 hover:text-[#ffffff] font-semibold group px-6 py-2 rounded-full hover:shadow-lg hover:bg-[#ff7e3d] transition-all"
                >
                    <ArrowLeftOutlined className="group-hover:-translate-x-1 transition-transform" />
                    <span>Quay lại danh sách</span>
                </button>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="relative h-96 rounded-3xl overflow-hidden shadow-2xl group">
                            {blog.imageUrl && (
                                <img
                                    src={blog.imageUrl}
                                    alt={blog.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    onError={(e) => {
                                        console.error("Image failed to load:", blog.imageUrl);
                                        (e.target as HTMLImageElement).src = "https://via.placeholder.com/1200x600?text=Blog+Post";
                                    }}
                                />
                            )}
                            {!blog.imageUrl && (
                                <img
                                    src="https://via.placeholder.com/1200x600?text=Blog+Post"
                                    alt={blog.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                        </div>

                        <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                            <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
                                {blog.title}
                            </h1>

                            <div className="flex items-center gap-6 text-gray-600 mb-6 pb-6 border-b-2 border-gray-100">
                                <div className="flex items-center gap-2">
                                    <UserOutlined className="text-[#FF8F50]" />
                                    <span className="font-semibold">
                                        {blog.authorName || "Admin"}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CalendarOutlined className="text-[#FF8F50]" />
                                    <span>{blog.createdAt ? formatDate(new Date(blog.createdAt)) : "N/A"}</span>
                                </div>
                            </div>

                            <div
                                className="text-gray-700 leading-relaxed space-y-4 [&_p]:mb-4 [&_p]:leading-7 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-3 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:mt-4 [&_h3]:mb-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-2"
                                dangerouslySetInnerHTML={{ __html: blog.content || "<p>Không có nội dung</p>" }}
                            />
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-3xl p-8 shadow-xl sticky top-24 border-2 border-orange-100 hover:shadow-2xl transition-shadow space-y-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">
                                Thông tin bài viết
                            </h3>

                            <div className="space-y-4 p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
                                <div className="flex flex-col gap-2">
                                    <span className="text-gray-600 font-medium text-sm">
                                        Tác giả
                                    </span>
                                    <span className="font-bold text-gray-900">
                                        {blog.authorName || "Admin"}
                                    </span>
                                </div>

                                <div className="flex flex-col gap-2 pt-4 border-t border-gray-200">
                                    <span className="text-gray-600 font-medium text-sm">
                                        Ngày đăng
                                    </span>
                                    <span className="font-bold text-gray-900">
                                        {blog.createdAt ? formatDateTime(new Date(blog.createdAt)) : "N/A"}
                                    </span>
                                </div>


                            </div>

                            <div className="pt-6 border-t-2 border-gray-100 text-center">
                                <p className="text-sm text-gray-600 mb-3 font-medium">
                                    💬 Cần hỗ trợ thêm thông tin?
                                </p>
                                <a
                                    href="/contact"
                                    className="text-[#FF8F50] font-bold hover:underline hover:text-[#ff7e3d] transition-colors"
                                >
                                    Liên hệ với chúng tôi →
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlogDetail;
