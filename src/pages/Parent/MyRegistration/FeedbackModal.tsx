import React, { useState } from "react";
import { Modal, Form, Input, Rate } from "antd";
import { useNotification } from "../../../contexts/NotificationContext";
import feedbackService from "../../../services/feedbackService";

interface FeedbackModalProps {
  visible: boolean;
  registrationId: number;
  campName: string;
  onClose: () => void;
  onSuccess: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({
  visible,
  registrationId,
  campName,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const { toastError } = useNotification();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      await feedbackService.createFeedback({
        registrationId,
        rating: values.rating || null,
        comment: values.comment || null,
      });

      form.resetFields();
      onSuccess();
    } catch (error: any) {
      if (error.errorFields) {
        return;
      }
      const errorMessage =
        error.response?.data?.message || "Không thể gửi đánh giá";
      toastError('Cảnh báo', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title="Đánh giá hội trại"
      open={visible}
      onOk={handleSubmit}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText="Gửi đánh giá"
      cancelText="Hủy"
      width={600}
    >
      <div className="mb-4">
        <p className="text-gray-700">
          Đánh giá cho hội trại: <strong>{campName}</strong>
        </p>
      </div>

      <Form form={form} layout="vertical">
        <Form.Item
          name="rating"
          label="Đánh giá"
          rules={[{ required: true, message: "Vui lòng chọn đánh giá" }]}
        >
          <Rate />
        </Form.Item>

        <Form.Item
          name="comment"
          label="Nhận xét"
          rules={[
            { required: true, message: "Vui lòng nhập nhận xét" },
            { min: 10, message: "Nhận xét phải có ít nhất 10 ký tự" },
          ]}
        >
          <Input.TextArea
            placeholder="Chia sẻ trải nghiệm của bạn về hội trại..."
            rows={5}
            showCount
            maxLength={500}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default FeedbackModal;
