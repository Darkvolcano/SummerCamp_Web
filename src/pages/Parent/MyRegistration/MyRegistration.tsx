import React, { useEffect, useState } from "react";
import { Spin, Modal, Tag, Empty } from "antd";
import {
  FileTextOutlined,
  EyeOutlined,
  CreditCardOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../services/userService";
import { useNotification } from "../../../contexts/NotificationContext";
import registrationService, {
  type RegistrationResponseDto,
} from "../../../services/registrationService";

const MyRegistration: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { toastSuccess, toastError } = useNotification();
  const [registrations, setRegistrations] = useState<RegistrationResponseDto[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [selectedRegistration, setSelectedRegistration] =
    useState<RegistrationResponseDto | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  // Fetch registration history
  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        setLoading(true);
        const data = await registrationService.getRegistrationHistory();
        setRegistrations(data);
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message || "Không thÃ t£i danh sách ng ký";
        toastError("L×i", errorMessage);
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

  // Handle view detail
  const handleViewDetail = (registration: RegistrationResponseDto) => {
    setSelectedRegistration(registration);
    setDetailModalVisible(true);
  };

  // Handle payment
  const handlePayment = async (registration: RegistrationResponseDto) => {
    try {
      setLoading(true);
      const paymentData = await registrationService.generatePaymentLink(
        registration.registrationId,
        {
          optionalChoices: registration.optionalChoices || null,
        }
      );

      if (paymentData.paymentUrl) {
        window.location.href = paymentData.paymentUrl;
      } else {
        toastError("L×i", "Không thÃ t¡o liên k¿t thanh toán");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Không thÃ t¡o liên k¿t thanh toán";
      toastError("L×i", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Get status color and label
  const getStatusInfo = (status: string) => {
    const statusMap: {
      [key: string]: { color: string; label: string };
    } = {
      PendingApproval: { color: "warning", label: "ChÝ duyÇt" },
      Rejected: { color: "error", label: "BË të chÑi" },
      Approved: { color: "success", label: "°ãc duyÇt" },
      PendingPayment: { color: "processing", label: "ChÝ thanh toán" },
      Confirmed: { color: "success", label: "Xác nh­n" },
      PendingRefund: { color: "warning", label: "ChÝ hoàn tiÁn" },
      OnGoing: { color: "processing", label: "ang diÅn ra" },
      Completed: { color: "success", label: "Hoàn thành" },
      Canceled: { color: "error", label: "ã hçy" },
    };

    return statusMap[status] || { color: "default", label: status };
  };

  if (loading && registrations.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-gray-600 font-semibold">
            ang t£i danh sách ng ký...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header Section */}
      <div className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-3 leading-tight">
            Danh sách ng ký cça tôi
          </h1>
          <p className="text-xl text-gray-600">
            Qu£n lý các ¡n ng ký tr¡i hè
          </p>
        </div>

        {registrations.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 shadow-lg text-center">
            <Empty
              description="B¡n ch°a ng ký tr¡i hè nào"
              style={{ marginBottom: 0 }}
            />
            <button
              onClick={() => navigate("/camps")}
              className="mt-8 bg-gradient-to-r from-[#FF8F50] to-[#ffb74d] hover:from-[#ffb74d] hover:to-[#FF8F50] text-white font-bold py-3 px-8 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              Khám phá tr¡i hè
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {registrations.map((registration) => (
              <div
                key={registration.registrationId}
                className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-shadow"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {registration.campName || "Tr¡i hè"}
                    </h3>
                    <p className="text-sm text-gray-600">
                      ng ký ngày:{" "}
                      {dayjs(registration.registrationCreateAt).format(
                        "DD/MM/YYYY HH:mm"
                      )}
                    </p>
                  </div>
                  <Tag
                    color={getStatusInfo(registration.status).color}
                    className="text-sm font-semibold px-3 py-1 rounded-full"
                  >
                    {getStatusInfo(registration.status).label}
                  </Tag>
                </div>

                {/* Content */}
                <div className="space-y-4 mb-6 pb-6 border-b border-gray-200">
                  {/* Final Price */}
                  <div>
                    <p className="text-xs text-gray-500 font-semibold mb-1">
                      GIÁ CUÐI CÙNG
                    </p>
                    <p className="text-2xl font-bold text-[#FF8F50]">
                      {registration.finalPrice?.toLocaleString("vi-VN")} «
                    </p>
                  </div>

                  {/* Applied Promotion */}
                  {registration.appliedPromotion && (
                    <div className="bg-orange-50 p-4 rounded-xl">
                      <p className="text-sm text-gray-600">
                        Mã khuy¿n mãi:{" "}
                        <span className="font-bold text-[#FF8F50]">
                          {registration.appliedPromotion.name}
                        </span>{" "}
                        ({registration.appliedPromotion.percent}%)
                      </p>
                    </div>
                  )}

                  {/* Campers */}
                  {registration.campers && registration.campers.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 font-semibold mb-2">
                        CÁC NG¯ÜI THAM GIA ({registration.campers.length})
                      </p>
                      <div className="space-y-2">
                        {registration.campers.map((camper) => (
                          <div
                            key={camper.camperId}
                            className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg"
                          >
                            {camper.avatar ? (
                              <img
                                src={camper.avatar}
                                alt={camper.camperName}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-[#FF8F50] flex items-center justify-center text-white font-bold text-sm">
                                {camper.camperName.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-gray-900">
                                {camper.camperName}
                              </p>
                              <p className="text-xs text-gray-600">
                                {camper.gender} - Sinh:{" "}
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
                    <div>
                      <p className="text-xs text-gray-500 font-semibold mb-1">
                        GHI CHÚ
                      </p>
                      <p className="text-sm text-gray-700 italic">
                        "{registration.note}"
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleViewDetail(registration)}
                    className="flex-1 flex items-center justify-center gap-2 bg-white text-gray-600 border-2 border-gray-200 font-bold py-3 px-4 rounded-full hover:border-[#FF8F50] hover:text-[#FF8F50] transition-all"
                  >
                    <EyeOutlined />
                    Chi ti¿t
                  </button>

                  {registration.status === "PendingPayment" && (
                    <button
                      onClick={() => handlePayment(registration)}
                      disabled={loading}
                      className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#FF8F50] to-[#ffb74d] hover:from-[#ffb74d] hover:to-[#FF8F50] text-white font-bold py-3 px-4 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      <CreditCardOutlined />
                      Thanh toán
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <FileTextOutlined className="text-[#FF8F50]" />
            <span>Chi ti¿t ng ký</span>
          </div>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={600}
        className="rounded-3xl"
      >
        {selectedRegistration && (
          <div className="space-y-6 max-h-96 overflow-y-auto">
            {/* Camp Name */}
            <div className="p-4 rounded-xl bg-orange-50">
              <p className="text-xs text-gray-500 font-semibold mb-1">
                TR I HÈ
              </p>
              <p className="text-lg font-bold text-gray-900">
                {selectedRegistration.campName}
              </p>
            </div>

            {/* Status */}
            <div className="p-4 rounded-xl border border-gray-200">
              <p className="text-xs text-gray-500 font-semibold mb-2">TR NG THÁI</p>
              <Tag
                color={getStatusInfo(selectedRegistration.status).color}
                className="text-sm font-semibold px-3 py-1 rounded-full"
              >
                {getStatusInfo(selectedRegistration.status).label}
              </Tag>
            </div>

            {/* Registration Date */}
            <div className="p-4 rounded-xl border border-gray-200">
              <p className="text-xs text-gray-500 font-semibold mb-1">
                NGÀY NG KÝ
              </p>
              <p className="text-gray-900">
                {dayjs(selectedRegistration.registrationCreateAt).format(
                  "DD/MM/YYYY HH:mm"
                )}
              </p>
            </div>

            {/* Final Price */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-orange-50 to-orange-100">
              <p className="text-xs text-gray-500 font-semibold mb-1">
                GIÁ CUÐI CÙNG
              </p>
              <p className="text-3xl font-bold text-[#FF8F50]">
                {selectedRegistration.finalPrice?.toLocaleString("vi-VN")} «
              </p>
            </div>

            {/* Applied Promotion */}
            {selectedRegistration.appliedPromotion && (
              <div className="p-4 rounded-xl border-2 border-orange-200 bg-orange-50">
                <p className="text-xs text-gray-500 font-semibold mb-2">
                  KHUY¾N MÃI ÁP DäNG
                </p>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900">
                    {selectedRegistration.appliedPromotion.name}
                  </span>
                  <span className="text-lg font-bold text-[#FF8F50]">
                    -{selectedRegistration.appliedPromotion.percent}%
                  </span>
                </div>
              </div>
            )}

            {/* Campers */}
            {selectedRegistration.campers &&
              selectedRegistration.campers.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 font-semibold mb-3">
                    NG¯ÜI THAM GIA ({selectedRegistration.campers.length})
                  </p>
                  <div className="space-y-3">
                    {selectedRegistration.campers.map((camper) => (
                      <div
                        key={camper.camperId}
                        className="p-4 rounded-xl border border-gray-200 hover:border-[#FF8F50] transition-colors"
                      >
                        <div className="flex items-start gap-3 mb-3">
                          {camper.avatar ? (
                            <img
                              src={camper.avatar}
                              alt={camper.camperName}
                              className="w-14 h-14 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-full bg-[#FF8F50] flex items-center justify-center text-white font-bold text-lg">
                              {camper.camperName.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="font-bold text-gray-900">
                              {camper.camperName}
                            </p>
                            <p className="text-sm text-gray-600">
                              {camper.gender}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700">
                          <span className="text-gray-600">Ngày sinh: </span>
                          {dayjs(camper.dob).format("DD/MM/YYYY")}
                        </p>
                        {camper.groupId && (
                          <p className="text-sm text-gray-700 mt-2">
                            <span className="text-gray-600">Nhóm: </span>
                            {camper.groupId}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Note */}
            {selectedRegistration.note && (
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                <p className="text-xs text-gray-500 font-semibold mb-2">GHI CHÚ</p>
                <p className="text-gray-900">{selectedRegistration.note}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MyRegistration;
