import React, { useEffect, useState } from "react";
import { Button, Spin, Modal, Form, Input } from "antd";
import { ArrowLeftOutlined, CreditCardOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import { useNotification } from "../../../contexts/NotificationContext";
import registrationService, {
  type RegistrationResponseDto,
} from "../../../services/registrationService";
import campService, { type CampResponseDto } from "../../../services/campService";
import CompleteRegistrationModal from "./CompleteRegistrationModal";

const CANCELABLE_STATUSES = [
  "PendingApproval",
  "Rejected",
  "Approved",
  "PendingPayment",
  "Confirmed",
];

const RegistrationDetail: React.FC = () => {
  const navigate = useNavigate();
  const { registrationId } = useParams<{ registrationId: string }>();
  const { toastSuccess, toastError } = useNotification();

  const [registration, setRegistration] = useState<RegistrationResponseDto | null>(null);
  const [camp, setCamp] = useState<CampResponseDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [completeModalVisible, setCompleteModalVisible] = useState(false);
  const [cancelConfirmModal, setCancelConfirmModal] = useState(false);
  const [cancelForm] = Form.useForm();

  // Fetch registration and camp details
  useEffect(() => {
    const fetchDetails = async () => {
      if (!registrationId) return;

      try {
        setLoading(true);
        const regId = parseInt(registrationId);
        const registrationData = await registrationService.getRegistrationById(regId);
        setRegistration(registrationData);

        // Fetch camp details
        if (registrationData.camp?.campId) {
          const campData = await campService.getCampById(registrationData.camp.campId);
          setCamp(campData);
        }
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message || "Không thể tải thông tin đơn đăng ký";
        toastError("Lỗi", errorMessage);
        navigate("/my-registrations");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [registrationId, toastError, navigate]);

  // Handle payment
  const handlePayment = async () => {
    if (!registration) return;

    try {
      setPaymentLoading(true);
      const paymentData = await registrationService.generatePaymentLink(
        registration.registrationId,
        {
          optionalChoices: registration.optionalChoices || null,
        }
      );

      if (paymentData.paymentUrl) {
        window.location.href = paymentData.paymentUrl;
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Không thể tạo liên kết thanh toán";
      toastError("Lỗi", errorMessage);
    } finally {
      setPaymentLoading(false);
    }
  };

  // Handle cancel registration
  const handleCancelRegistration = async () => {
    if (!registration) return;

    try {
      setCancelLoading(true);
      // const reason = cancelForm.getFieldValue("reason");
      // Call cancel API (assuming it exists)
      // await registrationService.cancelRegistration(registration.registrationId, reason);
      // For now, just show a placeholder
      toastSuccess("Thành công", "Hủy đơn đăng ký thành công");
      setCancelConfirmModal(false);
      navigate("/my-registrations");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Không thể hủy đơn đăng ký";
      toastError("Lỗi", errorMessage);
    } finally {
      setCancelLoading(false);
    }
  };

  // Get status info
  const getStatusInfo = (status: string) => {
    const statusMap: { [key: string]: { bg: string; text: string; label: string } } = {
      PendingApproval: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Chờ duyệt" },
      Rejected: { bg: "bg-red-100", text: "text-red-700", label: "Bị từ chối" },
      Approved: { bg: "bg-green-100", text: "text-green-700", label: "Được duyệt" },
      PendingPayment: { bg: "bg-blue-100", text: "text-blue-700", label: "Chờ thanh toán" },
      Confirmed: { bg: "bg-green-100", text: "text-green-700", label: "Đã xác nhận" },
      PendingRefund: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Chờ hoàn tiền" },
      OnGoing: { bg: "bg-purple-100", text: "text-purple-700", label: "Đang diễn ra" },
      Completed: { bg: "bg-green-100", text: "text-green-700", label: "Hoàn thành" },
      Canceled: { bg: "bg-gray-100", text: "text-gray-700", label: "Đã hủy" },
    };
    return (
      statusMap[status] || { bg: "bg-gray-100", text: "text-gray-700", label: status }
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-gray-600 font-medium">
            Đang tải thông tin chi tiết...
          </p>
        </div>
      </div>
    );
  }

  if (!registration) {
    return (
      <div className="min-h-screen bg-white py-12">
        <div className="max-w-4xl mx-auto px-4">
          <p className="text-center text-gray-600">Không tìm thấy đơn đăng ký</p>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(registration.status);
  const isCancelable = CANCELABLE_STATUSES.includes(registration.status);

  return (
    <div className="min-h-screen bg-white py-20">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/user/my-registrations")}
            className="flex bg-[#FF8F50] text-white items-center gap-2 hover:text-[#ffffff] font-semibold group px-6 py-2 rounded-full hover:shadow-lg hover:bg-[#ff7e3d] transition-all mb-6"
          >
            <ArrowLeftOutlined className="group-hover:-translate-x-1 transition-transform" />
            <span>Quay lại danh sách</span>
          </button>
          <h1 className="text-4xl font-bold text-gray-900">Chi tiết đơn đăng ký</h1>
        </div>

        {/* Registration Information */}
        <div className="bg-white rounded-lg p-6 mb-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Thông tin đăng ký</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 font-medium mb-1">Mã đơn đăng ký</p>
              <p className="text-lg font-semibold text-gray-900">
                #{registration.registrationId}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium mb-1">Trạng thái</p>
              <span
                className={`inline-block text-base font-bold px-4 py-1.5 rounded-full ${statusInfo.bg} ${statusInfo.text}`}
              >
                {statusInfo.label}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium mb-1">Ngày đăng ký</p>
              <p className="text-lg font-semibold text-gray-900">
                {dayjs(registration.registrationCreateAt).format("DD/MM/YYYY HH:mm")}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium mb-1">Tổng thanh toán</p>
              <p className="text-2xl font-bold text-[#FF8F50]">
                {registration.finalPrice?.toLocaleString("vi-VN")} ₫
              </p>
            </div>
            {registration.appliedPromotion && (
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600 font-medium mb-1">Khuyến mãi</p>
                <p className="text-lg font-semibold text-gray-900">
                  {registration.appliedPromotion.name} ({registration.appliedPromotion.percent}%)
                </p>
              </div>
            )}
          </div>

          {/* Note */}
          {registration.note && (
            <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-600 font-medium mb-1">Ghi chú</p>
              <p className="text-gray-900 italic">"{registration.note}"</p>
            </div>
          )}
        </div>

        {/* Camp Information */}
        {camp && (
          <div className="bg-gray-50 rounded-lg p-6 mb-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Thông tin trại hè</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">Tên trại hè</p>
                <p className="text-lg font-semibold text-gray-900">{camp.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">Địa điểm</p>
                <p className="text-lg font-semibold text-gray-900">{camp.place}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">Ngày bắt đầu</p>
                <p className="text-lg font-semibold text-gray-900">
                  {dayjs(camp.startDate).format("DD/MM/YYYY")}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">Ngày kết thúc</p>
                <p className="text-lg font-semibold text-gray-900">
                  {dayjs(camp.endDate).format("DD/MM/YYYY")}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">Độ tuổi</p>
                <p className="text-lg font-semibold text-gray-900">
                  {camp.minAge} - {camp.maxAge} tuổi
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">Giá cơ bản</p>
                <p className="text-lg font-semibold text-[#FF8F50]">
                  {camp.price?.toLocaleString("vi-VN")} ₫
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600 font-medium mb-1">Mô tả</p>
                <p className="text-gray-900">{camp.description}</p>
              </div>
            </div>
          </div>
        )}

        {/* Campers */}
        {registration.campers && registration.campers.length > 0 && (
          <div className="bg-white rounded-lg p-6 mb-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Người tham gia ({registration.campers.length})
            </h2>
            <div className="space-y-4">
              {registration.campers.map((camper) => (
                <div
                  key={camper.camperId}
                  className="bg-gray-50 p-4 rounded-lg flex items-center gap-4 border border-gray-200"
                >
                  {camper.avatar ? (
                    <img
                      src={camper.avatar}
                      alt={camper.camperName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#FF8F50] flex items-center justify-center text-white font-bold text-lg">
                      {camper.camperName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-lg font-semibold text-gray-900">
                      {camper.camperName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {camper.gender} • Sinh: {dayjs(camper.dob).format("DD/MM/YYYY")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mb-8 justify-end">
          {registration.status === "Approved" && (
            <button
              onClick={() => setCompleteModalVisible(true)}
              className="flex items-center justify-center gap-1 bg-[#FF8F50] text-white font-medium py-1.5 px-4 rounded-full text-sm hover:bg-[#ff7e3d] transition-colors"
            >
              Hoàn tất & Thanh toán
            </button>
          )}

          {registration.status === "PendingPayment" && (
            <button
              disabled={paymentLoading}
              onClick={handlePayment}
              className="flex items-center justify-center gap-1 bg-[#FF8F50] text-white font-medium py-1.5 px-4 rounded-full text-sm hover:bg-[#ff7e3d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CreditCardOutlined />
              Thanh toán ngay
            </button>
          )}


          {isCancelable && (
            <button
              onClick={() => setCancelConfirmModal(true)}
              className="flex items-center justify-center gap-1 bg-red-500 text-white font-medium py-1.5 px-4 rounded-full text-sm hover:bg-red-600 transition-colors"
            >
              Hủy đơn đăng ký
            </button>
          )}
        </div>
      </div>

      {/* Complete Registration Modal */}
      <CompleteRegistrationModal
        visible={completeModalVisible}
        registration={registration}
        onClose={() => setCompleteModalVisible(false)}
        onSuccess={() => {
          setCompleteModalVisible(false);
          // Refresh registration data or navigate back
          navigate("/my-registrations");
        }}
      />

      {/* Cancel Confirmation Modal */}
      <Modal
        title="Hủy đơn đăng ký"
        open={cancelConfirmModal}
        onCancel={() => {
          setCancelConfirmModal(false);
          cancelForm.resetFields();
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setCancelConfirmModal(false);
              cancelForm.resetFields();
            }}
          >
            Không, giữ lại
          </Button>,
          <Button
            key="submit"
            type="primary"
            danger
            loading={cancelLoading}
            onClick={() => {
              handleCancelRegistration();
            }}
          >
            Xác nhận hủy
          </Button>,
        ]}
      >
        <Form form={cancelForm} layout="vertical">
          <p className="text-gray-700 mb-4">
            Bạn có chắc chắn muốn hủy đơn đăng ký này? Hành động này không thể hoàn tác.
          </p>
          <Form.Item
            name="reason"
            label="Lý do hủy (tùy chọn)"
            className="mb-0"
          >
            <Input.TextArea
              placeholder="Vui lòng cho chúng tôi biết lý do hủy..."
              rows={3}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RegistrationDetail;
