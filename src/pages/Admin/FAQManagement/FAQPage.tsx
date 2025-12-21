import React, { useCallback, useEffect, useState } from "react";
import { Plus, Edit2 } from "lucide-react";
import { Modal, Form, Spin } from "antd";
import faqService, { type FAQResponseDto, type FAQRequestDto } from "../../../services/faqService";
import DeletePopover from "../../../components/DeletePopover";
import { useNotification } from "../../../contexts/NotificationContext";
import { CKEditorComponent } from "../../../components/CKEditor/CKEditor";

const FAQPage: React.FC = () => {
    const { toastSuccess, toastError } = useNotification();
    const [faqs, setFaqs] = useState<FAQResponseDto[]>([]);
    const [loading, setLoading] = useState(true);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingFaq, setEditingFaq] = useState<FAQResponseDto | null>(null);
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);
    const [deletePopoverOpen, setDeletePopoverOpen] = useState<number | null>(null);

    const fetchFaqs = useCallback(async () => {
        try {
            setLoading(true);
            const data = await faqService.getAllFaqs();
            setFaqs(data);
        } catch (error) {
            console.error("Error fetching FAQs:", error);
            toastError("Lỗi", "Không thể tải FAQs");
        } finally {
            setLoading(false);
        }
    }, [toastError]);

    useEffect(() => {
        fetchFaqs();
    }, [fetchFaqs]);

    const handleAddClick = () => {
        setEditingFaq(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEditClick = (faq: FAQResponseDto) => {
        setEditingFaq(faq);
        form.setFieldsValue({
            question: faq.question,
            answer: faq.answer,
        });
        setIsModalVisible(true);
    };

    const handleQuestionChange = (value: string) => {
        form.setFieldsValue({ question: value });
    };

    const handleAnswerChange = (value: string) => {
        form.setFieldsValue({ answer: value });
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setSubmitting(true);

            const payload: FAQRequestDto = {
                question: values.question,
                answer: values.answer,
            };

            if (editingFaq) {
                await faqService.updateFaq(editingFaq.faqId, payload);
                toastSuccess("Thành công", "Cập nhật FAQ thành công");
            } else {
                await faqService.createFaq(payload);
                toastSuccess("Thành công", "Tạo FAQ thành công");
            }

            await fetchFaqs();
            setIsModalVisible(false);
            form.resetFields();
            setEditingFaq(null);
        } catch (error) {
            console.error("Error submitting FAQ:", error);
            toastError("Lỗi", "Không thể lưu FAQ");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await faqService.deleteFaq(id);
            toastSuccess("Thành công", "Xóa FAQ thành công");
            await fetchFaqs();
            setDeletePopoverOpen(null);
        } catch (error) {
            console.error("Failed to delete FAQ:", error);
            toastError("Lỗi", "Không thể xóa FAQ");
        }
    };

    return (
        <div className="min-h-screen bg-[#F9FAFB] p-6">
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[#111827]">FAQs</h1>
                    <p className="text-xs text-[#6B7280] mt-0.5">Quản lý câu hỏi thường gặp</p>
                </div>
                <button
                    onClick={handleAddClick}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#6366F1] text-white rounded-lg hover:bg-[#4F46E5] transition-all font-medium text-sm"
                >
                    <Plus size={16} />
                    Tạo FAQ
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-96">
                    <Spin size="large" />
                </div>
            ) : faqs.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-12 text-center">
                    <p className="text-[#6B7280] text-lg mb-4">Chưa có FAQ nào</p>
                    <button
                        onClick={handleAddClick}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#6366F1] text-white rounded-lg hover:bg-[#4F46E5] transition-all font-medium text-sm"
                    >
                        <Plus size={16} />
                        Tạo FAQ
                    </button>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] overflow-hidden">
                    <div className="px-6 py-4 border-b border-[#E5E7EB]">
                        <h2 className="text-lg font-bold text-[#111827]">Tổng số: {faqs.length}</h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Câu Hỏi</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Câu Trả Lời</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Thao Tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E5E7EB]">
                                {faqs.map((faq) => (
                                    <tr key={faq.faqId} className="hover:bg-[#F9FAFB] transition-colors">
                                        <td className="px-6 py-4">
                                            <div
                                                className="text-sm font-medium text-[#111827] line-clamp-2"
                                                dangerouslySetInnerHTML={{ __html: faq.question }}
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div
                                                className="text-sm text-[#6B7280] line-clamp-3"
                                                dangerouslySetInnerHTML={{ __html: faq.answer }}
                                            />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEditClick(faq)}
                                                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#F3F4F6] text-[#6B7280] rounded-lg hover:bg-[#E5E7EB] transition-all font-medium text-sm"
                                                    title="Sửa FAQ"
                                                >
                                                    <Edit2 size={16} />
                                                    Sửa
                                                </button>
                                                <DeletePopover
                                                    onConfirm={() => handleDelete(faq.faqId)}
                                                    title="Xóa FAQ"
                                                    message={`Bạn có chắc muốn xóa FAQ?`}
                                                    buttonText="Xóa"
                                                    isOpen={deletePopoverOpen === faq.faqId}
                                                    onOpenChange={(open) => setDeletePopoverOpen(open ? faq.faqId : null)}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <Modal
                title={editingFaq ? "Sửa FAQ" : "Tạo FAQ"}
                open={isModalVisible}
                onOk={handleSubmit}
                onCancel={() => {
                    setIsModalVisible(false);
                    setEditingFaq(null);
                    form.resetFields();
                }}
                confirmLoading={submitting}
                width={700}
                okText={editingFaq ? "Cập Nhật" : "Tạo"}
            >
                <Form form={form} layout="vertical" className="mt-4">
                    <Form.Item
                        name="question"
                        rules={[{ required: true, message: "Vui lòng nhập câu hỏi!" }]}
                    >
                        <CKEditorComponent
                            name="question"
                            label="Câu Hỏi"
                            value={form.getFieldValue("question") || ""}
                            onChange={handleQuestionChange}
                            required={true}
                        />
                    </Form.Item>

                    <Form.Item
                        name="answer"
                        rules={[{ required: true, message: "Vui lòng nhập câu trả lời!" }]}
                    >
                        <CKEditorComponent
                            name="answer"
                            label="Câu Trả Lời"
                            value={form.getFieldValue("answer") || ""}
                            onChange={handleAnswerChange}
                            required={true}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default FAQPage;