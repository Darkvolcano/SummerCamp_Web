import React, { useEffect, useState } from "react";
import { Spin, Tabs, Empty, Button } from "antd";
import { ArrowLeftOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import { useNotification } from "../../../contexts/NotificationContext";
import { PagePath } from "../../../enums/page-path.enum";
import camperService, {
  type CamperResponseDto,
  type CamperGuardianResponseDto,
} from "../../../services/camperService";
import registrationService, {
  type RegistrationResponseDto,
} from "../../../services/registrationService";

interface CamperRegistration {
  registrationId: number;
  campId: number;
  campName: string;
  status: string;
  registrationDate: string;
}

const CamperDetail: React.FC = () => {
  const navigate = useNavigate();
  const { camperId } = useParams<{ camperId: string }>();
  const { toastError, toastSuccess } = useNotification();

  const [camper, setCamper] = useState<CamperResponseDto | null>(null);
  const [guardians, setGuardians] = useState<CamperGuardianResponseDto[]>([]);
  const [registrations, setRegistrations] = useState<CamperRegistration[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch camper details
  useEffect(() => {
    const fetchCamperDetails = async () => {
      if (!camperId) return;

      try {
        setLoading(true);
        const camperId_num = parseInt(camperId);

        // Fetch camper info
        const camperData = await camperService.getCamperById(camperId_num);
        setCamper(camperData);

        // Fetch guardians info - don't fail the page if this fails
        try {
          const guardiansData = await camperService.getCamperGuardians(camperId_num);
          setGuardians(guardiansData);
        } catch (guardianError) {
          console.warn("Failed to fetch guardians:", guardianError);
          setGuardians([]);
        }

        // Fetch registrations (we'll need to get all registrations and filter)
        // Note: This is a workaround since there's no direct API to get registrations by camperId
        try {
          const allRegistrations = await registrationService.getAllRegistrations();
          const camperRegistrations: CamperRegistration[] = [];

          for (const registration of allRegistrations) {
            if (registration.campers?.some((c) => c.camperId === camperId_num)) {
              camperRegistrations.push({
                registrationId: registration.registrationId,
                campId: registration.camp.campId,
                campName: registration.camp.name,
                status: registration.status,
                registrationDate: registration.registrationCreateAt,
              });
            }
          }

          setRegistrations(camperRegistrations);
        } catch (registrationError) {
          console.warn("Failed to fetch registrations:", registrationError);
          setRegistrations([]);
        }
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message || "Không thể tải thông tin trại viên";
        toastError("Lỗi", errorMessage);
        navigate(PagePath.USER_MYCAMPERS);
      } finally {
        setLoading(false);
      }
    };

    fetchCamperDetails();
  }, [camperId, toastError, navigate]);

  // Handle delete camper
  const handleDeleteCamper = async () => {
    if (!camper) return;

    try {
      setDeleteLoading(true);
      await camperService.deleteCamper(camper.camperId);
      toastSuccess("Thành công", "Xóa trại viên thành công");
      navigate(PagePath.USER_MYCAMPERS);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Không thể xóa trại viên";
      toastError("Lỗi", errorMessage);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Get gender display
  const getGenderDisplay = (gender: string) => {
    const genderMap: { [key: string]: string } = {
      Male: "Nam",
      Female: "Nữ",
      Other: "Khác",
    };
    return genderMap[gender] || gender;
  };

  // Get registration status display
  const getStatusInfo = (status: string) => {
    const statusMap: { [key: string]: { bg: string; text: string; label: string } } = {
      PendingApproval: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Chờ duyệt" },
      Rejected: { bg: "bg-red-100", text: "text-red-700", label: "Bị từ chối" },
      Approved: { bg: "bg-green-100", text: "text-green-700", label: "Được duyệt" },
      PendingPayment: { bg: "bg-blue-100", text: "text-blue-700", label: "Chờ thanh toán" },
      Confirmed: { bg: "bg-green-100", text: "text-green-700", label: "Xác nhận" },
      PendingRefund: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Chờ hoàn tiền" },
      OnGoing: { bg: "bg-purple-100", text: "text-purple-700", label: "Đang diễn ra" },
      Completed: { bg: "bg-green-100", text: "text-green-700", label: "Hoàn thành" },
      Canceled: { bg: "bg-gray-100", text: "text-gray-700", label: "Đã hủy" },
    };
    return (
      statusMap[status] || { bg: "bg-gray-100", text: "text-gray-700", label: status }
    );
  };

  // Calculate age from DOB
  const calculateAge = (dob: string) => {
    return dayjs().diff(dayjs(dob), "year");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-gray-600 font-medium">
            Đang tải thông tin trại viên...
          </p>
        </div>
      </div>
    );
  }

  if (!camper) {
    return (
      <div className="min-h-screen bg-white py-12">
        <div className="max-w-4xl mx-auto px-4">
          <p className="text-center text-gray-600">Không tìm thấy trại viên</p>
        </div>
      </div>
    );
  }

  const tabItems = [
    {
      key: "info",
      label: "Thông tin trại viên",
      children: (
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Thông tin cơ bản</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600 font-medium mb-2">Tên trại viên</p>
                <p className="text-lg font-semibold text-gray-900">{camper.camperName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium mb-2">Giới tính</p>
                <span className="inline-block text-sm font-medium px-3 py-1.5 rounded-full bg-blue-100 text-blue-700">
                  {getGenderDisplay(camper.gender)}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium mb-2">Ngày sinh</p>
                <p className="text-lg font-semibold text-gray-900">
                  {dayjs(camper.dob).format("DD/MM/YYYY")}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium mb-2">Tuổi</p>
                <p className="text-lg font-semibold text-gray-900">
                  {calculateAge(camper.dob)} tuổi
                </p>
              </div>
            </div>
          </div>

          {/* Avatar */}
          {camper.avatar && (
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Ảnh đại diện</h3>
              <div className="flex justify-center">
                <img
                  src={camper.avatar}
                  alt={camper.camperName}
                  className="w-48 h-48 rounded-lg object-cover"
                />
              </div>
            </div>
          )}

          {/* Health Record */}
          {camper.healthRecord && (
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Hồ sơ sức khỏe</h3>
              <div className="space-y-4">
                {camper.healthRecord.condition && (
                  <div>
                    <p className="text-sm text-gray-600 font-medium mb-1">Tình trạng sức khỏe</p>
                    <p className="text-gray-900">{camper.healthRecord.condition}</p>
                  </div>
                )}

                {camper.healthRecord.allergies && (
                  <div>
                    <p className="text-sm text-gray-600 font-medium mb-1">Dị ứng</p>
                    <p className="text-gray-900">{camper.healthRecord.allergies}</p>
                  </div>
                )}

                {camper.healthRecord.isAllergy && (
                  <div>
                    <p className="text-sm text-gray-600 font-medium mb-1">Có dị ứng</p>
                    <span className="inline-block text-sm font-medium px-3 py-1 rounded-full bg-red-100 text-red-700">
                      Có dị ứng
                    </span>
                  </div>
                )}

                {camper.healthRecord.note && (
                  <div>
                    <p className="text-sm text-gray-600 font-medium mb-1">Ghi chú</p>
                    <p className="text-gray-900">{camper.healthRecord.note}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Guardians */}
          {guardians.length > 0 && (
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Người giám hộ</h3>
              <div className="space-y-4">
                {guardians.map((g) =>
                  g.guardians.map((guardian) => (
                    <div
                      key={guardian.guardianId}
                      className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-600 font-medium mb-1">Họ tên</p>
                          <p className="text-gray-900 font-medium">{guardian.fullName}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 font-medium mb-1">Mối quan hệ</p>
                          <p className="text-gray-900 font-medium">{guardian.title}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 font-medium mb-1">Giới tính</p>
                          <p className="text-gray-900 font-medium">
                            {getGenderDisplay(guardian.gender)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "registrations",
      label: "Trạng thái trại hè",
      children: (
        <div>
          {registrations.length === 0 ? (
            <Empty description="Chưa có đơn đăng ký trại hè" />
          ) : (
            <div className="space-y-4">
              {registrations.map((reg) => {
                const statusInfo = getStatusInfo(reg.status);
                return (
                  <div
                    key={reg.registrationId}
                    className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                      <div>
                        <p className="text-sm text-gray-600 font-medium mb-1">Tên trại hè</p>
                        <p className="text-lg font-semibold text-gray-900">{reg.campName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-medium mb-1">Trạng thái</p>
                        <span
                          className={`inline-block text-sm font-bold px-4 py-1.5 rounded-full ${statusInfo.bg} ${statusInfo.text}`}
                        >
                          {statusInfo.label}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-medium mb-1">Ngày đăng ký</p>
                        <p className="text-gray-900 font-medium">
                          {dayjs(reg.registrationDate).format("DD/MM/YYYY HH:mm")}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-medium mb-1">Mã đơn đăng ký</p>
                        <p className="text-gray-900 font-medium">#{reg.registrationId}</p>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        navigate(PagePath.USER_MYREGISTRATIONS_DETAIL.replace(":registrationId", reg.registrationId.toString()))
                      }
                      className="w-full mt-4 px-4 py-2 bg-[#FF8F50] text-white rounded-lg font-medium hover:bg-[#ff7e3d] transition-colors"
                    >
                      Xem chi tiết đơn đăng ký
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-white py-20">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(PagePath.USER_MYCAMPERS)}
            className="flex bg-[#FF8F50] text-white items-center gap-2 hover:text-[#ffffff] font-semibold group px-6 py-2 rounded-full hover:shadow-lg hover:bg-[#ff7e3d] transition-all mb-6"
          >
            <ArrowLeftOutlined className="group-hover:-translate-x-1 transition-transform" />
            <span>Quay lại danh sách</span>
          </button>
          <h1 className="text-4xl font-bold text-gray-900">Chi tiết trại viên</h1>
        </div>

        {/* Tabs */}
        <Tabs items={tabItems} defaultActiveKey="info" />

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mt-8 justify-end">
          <button
            onClick={() => navigate(PagePath.USER_CAMPER_EDIT.replace(":camperId", camper.camperId.toString()))}
            className="flex items-center justify-center gap-1 bg-blue-500 text-white font-medium py-1.5 px-4 rounded-full text-sm hover:bg-blue-600 transition-colors"
          >
            <EditOutlined />
            Chỉnh sửa
          </button>
          <button
            disabled={deleteLoading}
            onClick={handleDeleteCamper}
            className="flex items-center justify-center gap-1 bg-red-500 text-white font-medium py-1.5 px-4 rounded-full text-sm hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <DeleteOutlined />
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
};

export default CamperDetail;
