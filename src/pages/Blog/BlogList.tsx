import React, { useState } from "react";
import { Spin } from "antd";
import { SearchOutlined, CalendarOutlined, UserOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useBlogActive } from "../../services/blogService";
import "./BlogList.css";

const BlogList: React.FC = () => {
    const navigate = useNavigate();
    const { data: blogs = [], isLoading: loading } = useBlogActive();
    const [searchTerm, setSearchTerm] = useState("");

    const filteredBlogs = blogs.filter((blog) => {
        const matchesSearch =
            blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            blog.content.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    const formatDate = (dateString: Date) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    return (
        <div className="blog-list-page">
            <section
                className="relative min-h-[700px] flex items-center justify-center overflow-hidden"
                style={{
                    background:
                        "linear-gradient(270deg, rgba(83, 83, 83, 0.86) 0%, rgba(25, 25, 25, 0.688) 33.5%, rgba(25, 25, 25, 0.86) 100%), url(https://res.cloudinary.com/da9zmbssb/image/upload/v1760079496/GroupLearn_a1codk.jpg)",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            >
                <div className="relative z-10 px-4 max-w-6xl mx-auto pt-20 pb-32">
                    <div className="max-w-3xl">
                        <h1 className="text-5xl md:text-5xl font-bold mb-6 leading-tight">
                            <span className="bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">
                                Khám phá bài viết
                            </span>
                            <span className="text-white text-4xl block mt-2">
                                Kiến thức và kinh nghiệm nuôi dạy con
                            </span>
                        </h1>
                        <p className="text-xl text-white/90 mb-8 leading-relaxed">
                            Tìm hiểu các mẹo hữu ích, chia sẻ kinh nghiệm và cập nhật thông tin mới nhất về
                            giáo dục và phát triển trẻ em.
                        </p>
                    </div>
                </div>
            </section>

            <div className="relative -mt-10 z-30 px-4 mb-16">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-full shadow-2xl p-2 flex items-center">
                        <div className="flex-1 px-6">
                            <input
                                type="text"
                                placeholder="Tìm kiếm bài viết..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full text-base font-semibold text-gray-800 border-none outline-none bg-transparent py-3"
                            />
                        </div>
                        <button className="bg-[#FF8F50] text-white rounded-full px-8 py-4 font-bold hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2 whitespace-nowrap hover:bg-[#ff7e3d]">
                            <SearchOutlined className="text-lg" />
                            <span>Tìm kiếm</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-12">
                <main className="flex-1">
                    {loading ? (
                        <div className="flex justify-center items-center min-h-[400px]">
                            <Spin size="large" />
                        </div>
                    ) : filteredBlogs.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="text-6xl mb-4">📝</div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                Không tìm thấy bài viết
                            </h3>
                            <p className="text-gray-600">
                                Thử thay đổi từ khóa tìm kiếm
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    Tất cả bài viết
                                </h2>
                                <p className="text-gray-600 mt-1">
                                    Hiển thị {filteredBlogs.length} bài viết
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                                {filteredBlogs.map((blog) => (
                                    <div
                                        key={blog.id}
                                        className="blog-card-wrapper border-4 border-[#c99877] cursor-pointer group relative h-72 overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300"
                                        onClick={() => navigate(`/blog-posts/${blog.id}`)}
                                    >
                                        <div className="image-card absolute inset-0 h-72 overflow-hidden rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                                            <img
                                                alt={blog.title}
                                                src={
                                                    blog.imageUrl ||
                                                    "https://via.placeholder.com/400x300?text=Blog+Post"
                                                }
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                onError={(e) => {
                                                    console.error("Blog list image failed to load:", blog.imageUrl, "blogId:", blog.id);
                                                    (e.target as HTMLImageElement).src = "https://via.placeholder.com/400x300?text=Blog+Post";
                                                }}
                                            />
                                        </div>

                                        <div className="postcard-info absolute inset-0 h-72 bg-[#f5e9d2] rounded-2xl shadow-lg p-6 transition-transform duration-500 ease-out translate-y-48 group-hover:translate-y-0 flex flex-col">
                                            <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">
                                                {blog.title}
                                            </h3>

                                            <div className="flex-1 overflow-hidden">
                                                <div className="flex items-center gap-4 text-gray-600 mb-3 text-xs">
                                                    <span className="flex items-center gap-1">
                                                        <UserOutlined className="flex-shrink-0" />
                                                        {blog.authorName || "Admin"}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <CalendarOutlined className="flex-shrink-0" />
                                                        {blog.createdAt ? formatDate(new Date(blog.createdAt)) : "N/A"}
                                                    </span>
                                                </div>

                                                <div
                                                    className="text-gray-600 text-sm mb-4 line-clamp-3 [&_p]:mb-1 [&_p]:leading-tight"
                                                    dangerouslySetInnerHTML={{
                                                        __html: (blog.content ? blog.content.substring(0, 150) : "Không có nội dung") + "...",
                                                    }}
                                                />

                                                <button className="w-full bg-gradient-to-r from-[#FF8F50] to-[#ff7e3d] text-white px-4 py-2 rounded-full text-sm font-semibold hover:shadow-lg transition-all duration-300 mt-auto">
                                                    Đọc tiếp
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </main>
            </div>
        </div>
    );
};

export default BlogList;
