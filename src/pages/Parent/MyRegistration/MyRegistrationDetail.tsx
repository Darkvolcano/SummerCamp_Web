import React, { useEffect, useState } from "react";
import { Button, Spin, Modal, Form, Input, Select } from "antd";
import { ArrowLeftOutlined, EditOutlined, StarOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import { useNotification } from "../../../contexts/NotificationContext";
import registrationService, {
  type RegistrationResponseDto,
} from "../../../services/registrationService";
import campService, { type CampResponseDto } from "../../../services/campService";
import bankUserService, { type BankUserResponseDto } from "../../../services/bankUserService";
import CompleteRegistrationModal from "./CompleteRegistrationModal";
import EditRegistrationModal from "./EditRegistrationModal";
import FeedbackModal from "./FeedbackModal";

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
  const [cancelLoading, setCancelLoading] = useState(false);
  const [completeModalVisible, setCompleteModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [cancelConfirmModal, setCancelConfirmModal] = useState(false);
  const [cancelForm] = Form.useForm();
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [bankAccounts, setBankAccounts] = useState<BankUserResponseDto[]>([]);
  const [loadingBankAccounts, setLoadingBankAccounts] = useState(false);
  const [createBankModalVisible, setCreateBankModalVisible] = useState(false);
  const [createBankForm] = Form.useForm();

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
        toastError('Cảnh báo', errorMessage);
        navigate("/my-registrations");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [registrationId, toastError, navigate]);

  // Handle edit registration
  const handleEditSuccess = async () => {
    setEditModalVisible(false);
    if (!registrationId) return;
    try {
      const regId = parseInt(registrationId);
      const registrationData = await registrationService.getRegistrationById(regId);
      setRegistration(registrationData);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Không thể tải thông tin đơn đăng ký";
      toastError('Cảnh báo', errorMessage);
    }
  };

  // Fetch bank accounts when opening cancel modal for Confirmed status
  const handleOpenCancelModal = async () => {
    if (!registration) return;

    // If status is Confirmed, need to fetch bank accounts
    if (registration.status === "Confirmed") {
      try {
        setLoadingBankAccounts(true);
        const accounts = await bankUserService.getMyBankAccounts();
        setBankAccounts(accounts);
      } catch {
        toastError('Cảnh báo', "Không thể tải danh sách tài khoản ngân hàng");
        setBankAccounts([]);
      } finally {
        setLoadingBankAccounts(false);
      }
    }

    setCancelConfirmModal(true);
  };

  // Handle create bank account
  const handleCreateBankAccount = async () => {
    try {
      const values = await createBankForm.validateFields();
      await bankUserService.createBankAccount(values);
      toastSuccess("Thành công", "Đã thêm tài khoản ngân hàng");
      
      // Refresh bank accounts
      const accounts = await bankUserService.getMyBankAccounts();
      setBankAccounts(accounts);
      
      setCreateBankModalVisible(false);
      createBankForm.resetFields();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Không thể thêm tài khoản ngân hàng";
      toastError('Cảnh báo', errorMessage);
    }
  };

  // Handle cancel registration
  const handleCancelRegistration = async () => {
    if (!registration) return;

    try {
      setCancelLoading(true);
      const values = await cancelForm.validateFields();
      
      const cancelData: any = {
        reason: values.reason || null,
      };

      // If status is Confirmed, include bankUserId
      if (registration.status === "Confirmed") {
        if (!values.bankUserId) {
          toastError('Cảnh báo', "Vui lòng chọn tài khoản ngân hàng");
          return;
        }
        cancelData.bankUserId = values.bankUserId;
      }

      await registrationService.cancelRegistration(registration.registrationId, cancelData);
      toastSuccess("Thành công", "Hủy đơn đăng ký thành công");
      setCancelConfirmModal(false);
      cancelForm.resetFields();
      navigate("/user/my-registrations");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Không thể hủy đơn đăng ký";
      toastError('Cảnh báo', errorMessage);
    } finally {
      setCancelLoading(false);
    }
  };

  // Handle feedback
  const handleOpenFeedbackModal = () => {
    setFeedbackModalVisible(true);
  };

  const handleCloseFeedbackModal = () => {
    setFeedbackModalVisible(false);
  };

  const handleFeedbackSuccess = () => {
    toastSuccess("Thành công", "Đánh giá của bạn đã được gửi!");
    handleCloseFeedbackModal();
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
      Refunded: { bg: "bg-green-100", text: "text-green-700", label: "Đã hoàn tiền" },
      Canceled: { bg: "bg-gray-100", text: "text-gray-700", label: "Đã hủy" },
    };
    return (
      statusMap[status] || { bg: "bg-gray-100", text: "text-gray-700", label: status }
    );
  };

  // Get camp status info
  const getCampStatusInfo = (status: string) => {
    const statusMap: { [key: string]: { bg: string; text: string; label: string } } = {
      Upcoming: { bg: "bg-blue-100", text: "text-blue-700", label: "Sắp diễn ra" },
      Ongoing: { bg: "bg-green-100", text: "text-green-700", label: "Đang diễn ra" },
      Completed: { bg: "bg-gray-100", text: "text-gray-700", label: "Đã hoàn thành" },
      Cancelled: { bg: "bg-red-100", text: "text-red-700", label: "Đã hủy" },
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
  
  const campStatusesPreventingCancellation = [
    'RegistrationClosed',
    'UnderEnrolled', 
    'InProgress',
    'Completed'
  ];
  const canCancelBasedOnCampStatus = camp 
    ? !campStatusesPreventingCancellation.includes(camp.status)
    : true;
  const showCancelButton = isCancelable && canCancelBasedOnCampStatus;

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

          {/* Reject/Cancel Reason */}
          {(registration.status === "Rejected" || registration.status === "Canceled") && registration.rejectReason && (
            <div className="mt-6 bg-red-50 p-4 rounded-lg border border-red-200">
              <p className="text-sm text-red-900 font-semibold mb-1">
                {registration.status === "Canceled" ? "Lý do hủy" : "Lý do từ chối"}
              </p>
              <p className="text-red-700 italic">"{registration.rejectReason}"</p>
            </div>
          )}
        </div>

        {/* Camp Information */}
        {camp && (
          <div className="bg-gray-50 rounded-lg p-6 mb-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Thông tin hội trại</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">Tên hội trại</p>
                <p className="text-lg font-semibold text-gray-900">{camp.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">Trạng thái trại</p>
                <span
                  className={`inline-block text-base font-bold px-4 py-1.5 rounded-full ${getCampStatusInfo(camp.status).bg} ${getCampStatusInfo(camp.status).text}`}
                >
                  {getCampStatusInfo(camp.status).label}
                </span>
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
          {(registration.status === "Rejected" || registration.status === "PendingApproval") && (
            <button
              onClick={() => setEditModalVisible(true)}
              className="flex items-center justify-center gap-1 bg-orange-500 text-white font-medium py-1.5 px-4 rounded-full text-sm hover:bg-orange-600 transition-colors"
            >
              <EditOutlined />
              Chỉnh sửa
            </button>
          )}

          {(registration.status === "Approved" || registration.status === "PendingPayment") && (
            <button
              onClick={() => setCompleteModalVisible(true)}
              className="flex items-center justify-center gap-1 bg-[#FF8F50] text-white font-medium py-1.5 px-4 rounded-full text-sm hover:bg-[#ff7e3d] transition-colors"
            >
              Hoàn tất & Thanh toán
            </button>
          )}

          {showCancelButton && (
            <button
              onClick={handleOpenCancelModal}
              className="flex items-center justify-center gap-1 bg-red-500 text-white font-medium py-1.5 px-4 rounded-full text-sm hover:bg-red-600 transition-colors"
            >
              Hủy đơn đăng ký
            </button>
          )}

          {isCancelable && !canCancelBasedOnCampStatus && (
            <p className="text-red-600 font-medium text-sm py-1.5">
              * Đã hết thời gian huỷ đăng ký
            </p>
          )}

          {registration.status === "Confirmed" && camp?.status === "Completed" && (
            <button
              onClick={handleOpenFeedbackModal}
              className="flex items-center justify-center gap-1 bg-yellow-500 text-white font-medium py-1.5 px-4 rounded-full text-sm hover:bg-yellow-600 transition-colors"
            >
              <StarOutlined />
              Đánh giá
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

      {/* Edit Registration Modal */}
      <EditRegistrationModal
        visible={editModalVisible}
        registration={registration}
        onClose={() => setEditModalVisible(false)}
        onSuccess={handleEditSuccess}
      />

      {/* Feedback Modal */}
      {registration && (
        <FeedbackModal
          visible={feedbackModalVisible}
          registrationId={registration.registrationId}
          campName={registration.camp?.name || "Hội trại"}
          onClose={handleCloseFeedbackModal}
          onSuccess={handleFeedbackSuccess}
        />
      )}

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
            onClick={handleCancelRegistration}
          >
            Xác nhận hủy
          </Button>,
        ]}
      >
        <Form form={cancelForm} layout="vertical">
          <p className="text-gray-700 mb-4">
            Bạn có chắc chắn muốn hủy đơn đăng ký này? Hành động này không thể hoàn tác.
          </p>

          {registration?.status === "Confirmed" && (
            <>
              <Form.Item
                name="bankUserId"
                label="Tài khoản ngân hàng nhận tiền hoàn"
                rules={[{ required: true, message: "Vui lòng chọn tài khoản ngân hàng" }]}
              >
                <Select
                  placeholder="Chọn tài khoản ngân hàng"
                  loading={loadingBankAccounts}
                  size="large"
                  notFoundContent={
                    <div className="text-center py-4">
                      <p className="text-gray-500 mb-2">Chưa có tài khoản ngân hàng</p>
                      <Button
                        type="link"
                        onClick={() => {
                          setCreateBankModalVisible(true);
                        }}
                      >
                        + Thêm tài khoản ngân hàng
                      </Button>
                    </div>
                  }
                >
                  {bankAccounts.map((account) => (
                    <Select.Option key={account.bankUserId} value={account.bankUserId}>
                      {account.bankName} - {account.bankNumber}
                      {account.isPrimary && " (Mặc định)"}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              {bankAccounts.length > 0 && (
                <div className="mb-4">
                  <Button
                    type="dashed"
                    block
                    onClick={() => setCreateBankModalVisible(true)}
                  >
                    + Thêm tài khoản ngân hàng mới
                  </Button>
                </div>
              )}
            </>
          )}

          <Form.Item
            name="reason"
            label="Lý do hủy"
            rules={[{ required: true, message: "Vui lòng nhập lý do hủy" }]}
          >
            <Input.TextArea
              placeholder="Vui lòng cho chúng tôi biết lý do hủy..."
              rows={4}
              showCount
              maxLength={500}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Create Bank Account Modal */}
      <Modal
        title="Thêm tài khoản ngân hàng"
        open={createBankModalVisible}
        onCancel={() => {
          setCreateBankModalVisible(false);
          createBankForm.resetFields();
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setCreateBankModalVisible(false);
              createBankForm.resetFields();
            }}
          >
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleCreateBankAccount}
          >
            Thêm tài khoản
          </Button>,
        ]}
      >
        <Form form={createBankForm} layout="vertical">
          <Form.Item
            name="bankName"
            label="Tên ngân hàng"
            rules={[{ required: true, message: "Vui lòng nhập tên ngân hàng" }]}
          >
            <Input placeholder="Ví dụ: Vietcombank, Techcombank..." size="large" />
          </Form.Item>

          <Form.Item
            name="bankCode"
            label="Mã ngân hàng"
            rules={[{ required: true, message: "Vui lòng nhập mã ngân hàng" }]}
          >
            <Input placeholder="Ví dụ: VCB, TCB..." size="large" />
          </Form.Item>

          <Form.Item
            name="bankNumber"
            label="Số tài khoản"
            rules={[{ required: true, message: "Vui lòng nhập số tài khoản" }]}
          >
            <Input placeholder="Nhập số tài khoản ngân hàng" size="large" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RegistrationDetail;
