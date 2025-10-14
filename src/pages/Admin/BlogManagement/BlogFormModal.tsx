import { useState, useEffect } from "react";
import { X, Save, FileText, Calendar } from "lucide-react";
import { message } from "antd";
import type { BlogResponseDto, BlogRequestDto } from "./BlogManagement";
import { CKEditorComponent } from "../../../components/CKEditor/CKEditor";
import "./BlogFormModal.css";

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
    const [formData, setFormData] = useState<BlogRequestDto>({
        title: "",
        content: "",
        authorId: 1, // TODO: Get from auth context
        publishedDate: new Date().toISOString().split("T")[0],
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (blog && isEditing) {
            setFormData({
                title: blog.title,
                content: blog.content,
                authorId: blog.authorId,
                publishedDate: new Date(blog.createdAt).toISOString().split("T")[0],
            });
        }
    }, [blog, isEditing]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Clear error for this field
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const handleContentChange = (value: string) => {
        setFormData((prev) => ({ ...prev, content: value }));
        // Clear error for content field
        if (errors.content) {
            setErrors((prev) => ({ ...prev, content: "" }));
        }
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.title.trim()) {
            newErrors.title = "Title is required";
        } else if (formData.title.length < 5) {
            newErrors.title = "Title must be at least 5 characters";
        }

        if (!formData.content.trim()) {
            newErrors.content = "Content is required";
        } else if (formData.content.length < 20) {
            newErrors.content = "Content must be at least 20 characters";
        }

        if (!formData.publishedDate) {
            newErrors.publishedDate = "Published date is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) {
            message.error("Please fix the validation errors");
            return;
        }

        try {
            setSaving(true);

            // TODO: Replace with actual API calls
            if (isEditing && blog) {
                console.log("Updating blog:", blog.id, formData);
                message.success("Blog updated successfully");
            } else {
                console.log("Creating blog:", formData);
                message.success("Blog created successfully");
            }

            onSuccess();
        } catch (error: any) {
            console.error("Error saving blog:", error);
            message.error(error.response?.data?.message || "Failed to save blog");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="modal-header">
                    <h2>{isEditing ? "Edit Blog Post" : "Create Blog Post"}</h2>
                    <button className="close-btn" onClick={onClose} type="button">
                        <X size={24} />
                    </button>
                </div>

                {/* Form */}
                <form className="blog-form" onSubmit={handleSubmit}>
                    <div className="form-scroll">
                        {/* Title */}
                        <div className="form-group">
                            <label>
                                <FileText size={16} />
                                Title <span className="required">*</span>
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Enter blog title"
                                className={errors.title ? "error" : ""}
                            />
                            {errors.title && (
                                <span className="error-message">{errors.title}</span>
                            )}
                        </div>

                        {/* Published Date */}
                        <div className="form-group">
                            <label>
                                <Calendar size={16} />
                                Published Date <span className="required">*</span>
                            </label>
                            <input
                                type="date"
                                name="publishedDate"
                                value={formData.publishedDate}
                                onChange={handleChange}
                                className={errors.publishedDate ? "error" : ""}
                            />
                            {errors.publishedDate && (
                                <span className="error-message">{errors.publishedDate}</span>
                            )}
                        </div>

                        {/* Content */}
                        <div className="form-group">
                            <CKEditorComponent
                                name="content"
                                label="Content"
                                value={formData.content}
                                onChange={handleContentChange}
                                required={true}
                            />
                            {errors.content && (
                                <span className="error-message">{errors.content}</span>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn-cancel"
                            onClick={onClose}
                            disabled={saving}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-save"
                            disabled={saving}
                        >
                            {saving ? (
                                <>
                                    <div className="spinner" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save size={20} />
                                    {isEditing ? "Update" : "Create"} Blog
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
