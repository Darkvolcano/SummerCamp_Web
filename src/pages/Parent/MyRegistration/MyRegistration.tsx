import React, { useEffect, useState, useMemo } from "react";
import { Spin, Empty, Collapse, Modal, Form, Input } from "antd";
import { CreditCardOutlined, SearchOutlined, CaretRightOutlined, EyeOutlined, EditOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { Button } from "antd";
import { useAuthStore } from "../../../services/userService";
import { useNotification } from "../../../contexts/NotificationContext";
import { PagePath } from "../../../enums/page-path.enum";
import registrationService, {
  type RegistrationResponseDto,
} from "../../../services/registrationService";
import CompleteRegistrationModal from "./CompleteRegistrationModal";

const STATUS_OPTIONS = [
  { key: "PendingApproval", label: "Chờ duyệt" },
  { key: "Rejected", label: "Bị từ chối" },
  { key: "Approved", label: "Được duyệt" },
  { key: "PendingPayment", label: "Chờ thanh toán" },
  { key: "Confirmed", label: "Xác nhận" },
  { key: "PendingRefund", label: "Chờ hoàn tiền" },
  { key: "OnGoing", label: "Đang diễn ra" },
  { key: "Completed", label: "Hoàn thành" },
  { key: "Canceled", label: "Đã hủy" },
];

const MyRegistration: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { toastError, toastSuccess } = useNotification();
  const [registrations, setRegistrations] = useState<RegistrationResponseDto[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [completeModalVisible, setCompleteModalVisible] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState<RegistrationResponseDto | null>(null);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelForm] = Form.useForm();

  // Fetch registration history
  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        setLoading(true);
        const data = await registrationService.getRegistrationHistory();
        setRegistrations(data);
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message || "Không thể tải danh sách đăng ký";
        toastError("Lỗi", errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchRegistrations();
    } else {
      navigate("/login");
    }
  }, [user, navigate, toastError]);

  // Filter registrations
  const filteredRegistrations = useMemo(() => {
    return registrations.filter((reg) => {
      const matchSearch = (reg.camp?.name || "")
        .toLowerCase()
        .includes(searchText.toLowerCase());
      const matchStatus = selectedStatuses.length === 0 || selectedStatuses.includes(reg.status);
      return matchSearch && matchStatus;
    });
  }, [registrations, searchText, selectedStatuses]);

  // Count registrations by status
  const getStatusCount = (status: string) => {
    return registrations.filter((reg) => reg.status === status).length;
  };

  // Handle complete registration
  const handleOpenCompleteModal = (registration: RegistrationResponseDto) => {
    setSelectedRegistration(registration);
    setCompleteModalVisible(true);
  };

  const handleCloseCompleteModal = () => {
    setCompleteModalVisible(false);
    setSelectedRegistration(null);
  };

  const handleCompleteSuccess = () => {
    // Refresh registrations list
    const fetchRegistrations = async () => {
      try {
        const data = await registrationService.getRegistrationHistory();
        setRegistrations(data);
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message || "Không thể tải danh sách đăng ký";
        toastError("Lỗi", errorMessage);
      }
    };
    fetchRegistrations();
  };

  // Handle payment
  const handlePayment = async (registration: RegistrationResponseDto) => {
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
    if (!selectedRegistration) return;

    try {
      setCancelLoading(true);
      // const reason = cancelForm.getFieldValue("reason");
      // Call cancel API (assuming it exists in registrationService)
      // await registrationService.cancelRegistration(selectedRegistration.registrationId, reason);
      // For now, just show success message
      toastSuccess("Thành công", "Hủy đơn đăng ký thành công");
      setCancelModalVisible(false);
      cancelForm.resetFields();
      // Refresh registrations list
      const data = await registrationService.getRegistrationHistory();
      setRegistrations(data);
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
    const statusMap: { [key: string]: { bg: string; text: string } } = {
      PendingApproval: { bg: "bg-yellow-100", text: "text-yellow-700" },
      Rejected: { bg: "bg-red-100", text: "text-red-700" },
      Approved: { bg: "bg-green-100", text: "text-green-700" },
      PendingPayment: { bg: "bg-blue-100", text: "text-blue-700" },
      Confirmed: { bg: "bg-green-100", text: "text-green-700" },
      PendingRefund: { bg: "bg-yellow-100", text: "text-yellow-700" },
      OnGoing: { bg: "bg-purple-100", text: "text-purple-700" },
      Completed: { bg: "bg-green-100", text: "text-green-700" },
      Canceled: { bg: "bg-gray-100", text: "text-gray-700" },
    };
    return statusMap[status] || { bg: "bg-gray-100", text: "text-gray-700" };
  };

  const getStatusLabel = (status: string) => {
    const found = STATUS_OPTIONS.find((s) => s.key === status);
    return found?.label || status;
  };

  if (loading && registrations.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white py-20">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-gray-600 font-medium">
            Đang tải danh sách đăng ký...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-20">
      {/* Header */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-5xl font-bold text-gray-900 mb-2">
          Danh sách đăng ký của tôi
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Quản lý các đơn đăng ký trại hè của bạn
        </p>

        {/* Search & Filter Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          {/* Search */}
          <div className="mb-6">
            <p className="text-sm font-bold text-gray-900 mb-3">Tìm kiếm:</p>
            <div className="relative">
              <SearchOutlined className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" style={{ color: "gray" }}/>
              <input
                type="text"
                placeholder="Tìm kiếm theo tên trại hè..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF8F50] focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <p className="text-sm font-bold text-gray-900 mb-3">Trạng thái:</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedStatuses([])}
                className={`px-3 py-1 text-sm rounded-full font-medium transition-all ${
                  selectedStatuses.length === 0
                    ? "bg-[#FF8F50] text-white border-2 border-[#FF8F50]"
                    : "bg-orange-50 text-gray-700 border-2 border-dashed border-[#FF8F50] hover:bg-orange-100"
                }`}
              >
                Tất cả ({registrations.length})
              </button>
              {STATUS_OPTIONS.map((status) => {
                const count = getStatusCount(status.key);
                const isSelected = selectedStatuses.includes(status.key);
                return (
                  <button
                    key={status.key}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedStatuses(selectedStatuses.filter((s) => s !== status.key));
                      } else {
                        setSelectedStatuses([...selectedStatuses, status.key]);
                      }
                    }}
                    className={`px-3 py-1 text-sm rounded-full font-medium transition-all ${
                      isSelected
                        ? "bg-[#FF8F50] text-white border-2 border-[#FF8F50]"
                        : "bg-orange-50 text-gray-700 border-2 border-dashed border-[#FF8F50] hover:bg-orange-100"
                    }`}
                  >
                    {status.label} ({count})
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* List */}
        {filteredRegistrations.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-12 text-center">
            <Empty
              description="Không tìm thấy đơn đăng ký"
              style={{ marginBottom: 0 }}
            />
            <button
              onClick={() => navigate("/camps")}
              className="mt-6 px-6 py-2 bg-[#FF8F50] text-white rounded-full font-medium hover:bg-[#ff7e3d] transition-colors"
            >
              Khám phá trại hè
            </button>
          </div>
        ) : (
          <Collapse
            bordered={false}
            expandIcon={({ isActive }) => (
              <CaretRightOutlined
                rotate={isActive ? 90 : 0}
                style={{ color: "#FF8F50", fontSize: "16px", transition: "transform 0.3s" }}
              />
            )}
            items={filteredRegistrations.map((registration, index) => ({
              key: registration.registrationId.toString(),
              style: {
                marginBottom: 16,
                background: "white",
                borderRadius: "12px",
                border: "1px solid #e5e7eb",
                overflow: "hidden",
              },
              label: (
                <div className="flex-1 flex items-center justify-between gap-4 py-3 px-2">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {/* Number */}
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <p className="text-sm font-bold text-gray-600">{index + 1}</p>
                    </div>

                    {/* Camp Name */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-gray-900 truncate">
                        {registration.camp?.name || "Trại hè"}
                      </h3>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-full ${getStatusInfo(
                      registration.status
                    ).bg} ${getStatusInfo(registration.status).text}`}
                  >
                    {getStatusLabel(registration.status)}
                  </span>

                  {/* Date */}
                  <div className="flex-shrink-0 text-center hidden sm:block">
                    <p className="text-xs text-gray-500 font-medium mb-0.5">NGÀY ĐĂNG KÝ</p>
                    <p className="text-sm text-gray-900 font-medium">
                      {dayjs(registration.registrationCreateAt).format("DD/MM/YYYY")}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="flex-shrink-0 text-center">
                    <p className="text-xs text-gray-500 font-medium mb-0.5">GIÁ</p>
                    <p className="text-sm font-bold text-[#FF8F50]">
                      {registration.finalPrice?.toLocaleString("vi-VN")} ₫
                    </p>
                  </div>
                </div>
              ),
              children: (
                <div className="space-y-4">
                  {/* Price */}
                  <div>
                    <p className="text-xs text-gray-600 font-medium mb-1">
                      TỔNG THANH TOÁN
                    </p>
                    <p className="text-2xl font-bold text-[#FF8F50]">
                      {registration.finalPrice?.toLocaleString("vi-VN")} ₫
                    </p>
                  </div>

                  {/* Promotion */}
                  {registration.appliedPromotion && (
                    <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                      <p className="text-xs text-gray-600 font-medium mb-1">
                        KHUYẾN MÃI
                      </p>
                      <p className="text-sm text-gray-900">
                        {registration.appliedPromotion.name} (
                        {registration.appliedPromotion.percent}%)
                      </p>
                    </div>
                  )}

                  {/* Campers */}
                  {registration.campers &&
                    registration.campers.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-600 font-medium mb-2">
                          TRẠI VIÊN: ({registration.campers.length})
                        </p>
                        <div className="space-y-2">
                          {registration.campers.map((camper) => (
                            <div
                              key={camper.camperId}
                              className="bg-gray-50 p-3 rounded-lg flex items-center gap-3"
                            >
                              {camper.avatar ? (
                                <img
                                  src={camper.avatar}
                                  alt={camper.camperName}
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-[#FF8F50] flex items-center justify-center text-white text-xs font-bold">
                                  {camper.camperName.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                  {camper.camperName}
                                </p>
                                <p className="text-xs text-gray-600">
                                  {camper.gender} • Sinh:{" "}
                                  {dayjs(camper.dob).format("DD/MM/YYYY")}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Note */}
                  {registration.note && (
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <p className="text-xs text-gray-600 font-medium mb-1">
                        GHI CHÚ
                      </p>
                      <p className="text-sm text-gray-900 italic">
                        "{registration.note}"
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => navigate(PagePath.USER_MYREGISTRATIONS_DETAIL.replace(":registrationId", registration.registrationId.toString()))}
                        className="flex items-center justify-center gap-1 bg-blue-500 text-white font-medium py-1.5 px-4 rounded-full text-sm hover:bg-blue-600 transition-colors"
                      >
                        <EyeOutlined />
                        Xem chi tiết
                      </button>

                      {registration.status === "Approved" && (
                        <button
                          onClick={() => handleOpenCompleteModal(registration)}
                          className="flex items-center justify-center gap-1 bg-[#FF8F50] text-white font-medium py-1.5 px-4 rounded-full text-sm hover:bg-[#ff7e3d] transition-colors"
                        >
                          Hoàn tất & Thanh toán
                        </button>
                      )}

                      {registration.status === "PendingPayment" && (
                        <button
                          onClick={() => handlePayment(registration)}
                          disabled={paymentLoading}
                          className="flex items-center justify-center gap-1 bg-[#FF8F50] text-white font-medium py-1.5 px-4 rounded-full text-sm hover:bg-[#ff7e3d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <CreditCardOutlined />
                          Thanh toán ngay
                        </button>
                      )}

                      {registration.status === "PendingApproval" && (
                        <button
                          onClick={() => navigate(PagePath.USER_MYREGISTRATIONS_DETAIL.replace(":registrationId", registration.registrationId.toString()))}
                          className="flex items-center justify-center gap-1 bg-[#FF8F50] text-white font-medium py-1.5 px-4 rounded-full text-sm hover:bg-[#ff7e3d] transition-colors"
                        >
                          <EditOutlined />
                          Chỉnh sửa
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ),
            }))}
            style={{ background: "transparent" }}
          />
        )}
      </div>

      {/* Complete Registration Modal */}
      <CompleteRegistrationModal
        visible={completeModalVisible}
        registration={selectedRegistration}
        onClose={handleCloseCompleteModal}
        onSuccess={handleCompleteSuccess}
      />

      {/* Cancel Registration Modal */}
      <Modal
        title="Hủy đơn đăng ký"
        open={cancelModalVisible}
        onCancel={() => {
          setCancelModalVisible(false);
          cancelForm.resetFields();
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setCancelModalVisible(false);
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
            Bạn có chắc chắn muốn hủy đơn đăng ký <strong>{selectedRegistration?.camp?.name}</strong>? Hành động này không thể hoàn tác.
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

export default MyRegistration;
