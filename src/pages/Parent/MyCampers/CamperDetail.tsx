import React, { useEffect, useState } from "react";
import { Spin, Tabs, Empty, Button, Modal, Form, Input, Select, DatePicker, Upload } from "antd";
import { ArrowLeftOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import { useNotification } from "../../../contexts/NotificationContext";
import { PagePath } from "../../../enums/page-path.enum";
import DeletePopover from "../../../components/DeletePopover";
import camperService, {
  type CamperResponseDto,
  type CamperUpdateRequestDto,
  type HealthRecordCreateDto,
} from "../../../services/camperService";
import registrationCamperService, {
  type RegistrationCamperResponseDto,
} from "../../../services/registrationCamperService";
import guardianService, {
  type GuardianResponseDto,
} from "../../../services/guardianService";

const CamperDetail: React.FC = () => {
  const navigate = useNavigate();
  const { camperId } = useParams<{ camperId: string }>();
  const { toastError, toastSuccess } = useNotification();

  const [camper, setCamper] = useState<CamperResponseDto | null>(null);
  const [guardians, setGuardians] = useState<GuardianResponseDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm] = Form.useForm();
  const [camperAvatarPreview, setCamperAvatarPreview] = useState<string | null>(null);

  // Guardian modal states
  const [isGuardianModalVisible, setIsGuardianModalVisible] = useState(false);
  const [guardianForm] = Form.useForm();
  const [guardianLoading, setGuardianLoading] = useState(false);
  const [deleteGuardianId, setDeleteGuardianId] = useState<number | null>(null);

  // Camp dropdown states
  const [camps, setCamps] = useState<RegistrationCamperResponseDto[]>([]);
  const [selectedCampIndex, setSelectedCampIndex] = useState(0);
  const [campsLoading, setCampsLoading] = useState(false);

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
        setCamperAvatarPreview(camperData.avatar || null);
        editForm.setFieldsValue({
          camperName: camperData.camperName,
          gender: camperData.gender,
          dob: camperData.dob ? dayjs(camperData.dob) : null,
          condition: camperData.healthRecord?.condition,
          allergies: camperData.healthRecord?.allergies,
          isAllergy: camperData.healthRecord?.isAllergy,
          note: camperData.healthRecord?.note,
        });

        // Fetch guardians info
        try {
          const guardiansData = await camperService.getCamperGuardians(camperId_num);
          const guardiansList = guardiansData.length > 0 ? guardiansData[0]?.guardians || [] : [];
          const guardianResponseList: GuardianResponseDto[] = guardiansList.map(g => ({
            guardianId: g.guardianId,
            camperId: camperId_num,
            userId: 0,
            fullName: g.fullName,
            title: g.title,
            gender: g.gender,
            email: g.email,
            phoneNumber: g.phoneNumber,
            isActive: true,
          }));
          setGuardians(guardianResponseList);
        } catch (guardianError) {
          console.warn("Failed to fetch guardians:", guardianError);
          setGuardians([]);
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
  }, [camperId, toastError, navigate, editForm]);

  // Fetch camps for camper
  useEffect(() => {
    const fetchCamps = async () => {
      if (!camperId) return;

      try {
        setCampsLoading(true);
        const camperId_num = parseInt(camperId);
        const campsData = await registrationCamperService.getCampByCamper(camperId_num);
        setCamps(campsData);

        // Find camp with nearest future startDate
        if (campsData.length > 0) {
          const now = dayjs();
          const futureCamps = campsData.filter(c => dayjs(c.camp.startDate).isAfter(now));

          if (futureCamps.length > 0) {
            // Sort by startDate and get the nearest one
            const nearestCamp = futureCamps.sort((a: RegistrationCamperResponseDto, b: RegistrationCamperResponseDto) =>
              dayjs(a.camp.startDate).diff(dayjs(b.camp.startDate))
            )[0];
            const index = campsData.findIndex(c => c.camp.campId === nearestCamp.camp.campId);
            setSelectedCampIndex(index >= 0 ? index : 0);
          } else {
            // If no future camps, select the first one
            setSelectedCampIndex(0);
          }
        }
      } catch (error: any) {
        console.warn("Failed to fetch camps:", error);
        setCamps([]);
      } finally {
        setCampsLoading(false);
      }
    };

    fetchCamps();
  }, [camperId]);

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

  // Handle save camper info
  const handleSaveCamper = async () => {
    try {
      const values = await editForm.validateFields();

      if (!camper) return;

      let dobValue = '';
      if (values.dob) {
        if (typeof values.dob === 'string') {
          dobValue = values.dob;
        } else if (values.dob.format) {
          dobValue = values.dob.format('YYYY-MM-DD');
        }
      }

      const healthRecord: HealthRecordCreateDto | undefined =
        values.condition || values.allergies || values.isAllergy || values.note
          ? {
              condition: values.condition || undefined,
              allergies: values.allergies || undefined,
              isAllergy: values.isAllergy || undefined,
              note: values.note || undefined,
            }
          : undefined;

      const updateData: CamperUpdateRequestDto = {
        camperName: values.camperName,
        gender: values.gender,
        dob: dobValue,
        healthRecord,
      };

      const updatedCamper = await camperService.updateCamper(camper.camperId, updateData);

      // Upload avatar separately if provided
      if (values.avatarFile) {
        await camperService.uploadCamperAvatar(
          camper.camperId,
          values.avatarFile as File
        );
      }

      setCamper(updatedCamper);
      setIsEditing(false);
      toastSuccess("Thành công", "Cập nhật thông tin trại viên thành công");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Không thể cập nhật thông tin trại viên";
      toastError("Lỗi", errorMessage);
    }
  };

  // Handle avatar upload
  const handleAvatarChange = (info: any) => {
    const file = info.file;
    const reader = new FileReader();
    reader.onload = (e) => {
      setCamperAvatarPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    editForm.setFieldValue("avatarFile", file);
  };

  // Handle add guardian
  const handleAddGuardian = async () => {
    try {
      if (!camper) return;

      const values = await guardianForm.validateFields();

      let dobValue = '';
      if (values.dob) {
        if (typeof values.dob === 'string') {
          dobValue = values.dob;
        } else if (values.dob.format) {
          dobValue = values.dob.format('YYYY-MM-DD');
        }
      }

      setGuardianLoading(true);

      const newGuardian = await guardianService.createGuardianForCamper(camper.camperId, {
        fullName: values.fullName,
        title: values.title,
        gender: values.gender,
        dob: dobValue || undefined,
        email: values.email,
        phoneNumber: values.phoneNumber,
      });

      setGuardians([...guardians, newGuardian]);
      setIsGuardianModalVisible(false);
      guardianForm.resetFields();
      toastSuccess("Thành công", "Thêm người giám hộ thành công");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Không thể thêm người giám hộ";
      toastError("Lỗi", errorMessage);
    } finally {
      setGuardianLoading(false);
    }
  };

  // Handle delete guardian
  const handleDeleteGuardian = async (guardianId: number) => {
    try {
      await guardianService.deleteGuardian(guardianId);
      setGuardians(guardians.filter((g) => g.guardianId !== guardianId));
      toastSuccess("Thành công", "Xoá người giám hộ thành công");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Không thể xoá người giám hộ";
      toastError("Lỗi", errorMessage);
    }
  };

  // Get gender display
  const getGenderDisplay = (gender: string) => {
    const genderMap: { [key: string]: string } = {
      Male: "Nam",
      Female: "Nữ",
      Other: "Khác",
      Nam: "Nam",
      Nữ: "Nữ",
      Khác: "Khác",
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
          {isEditing ? (
            <Form form={editForm} layout="vertical" className="space-y-4">
              {/* Avatar */}
              <Form.Item label="Ảnh đại diện" name="avatarFile">
                <div className="space-y-4">
                  {camperAvatarPreview ? (
                    <div className="flex flex-col items-center gap-4">
                      <img
                        src={camperAvatarPreview}
                        alt="Preview"
                        className="w-32 h-32 rounded-lg object-cover border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setCamperAvatarPreview(null);
                          editForm.setFieldValue("avatarFile", undefined);
                        }}
                        className="text-sm text-red-500 hover:text-red-700"
                      >
                        Xóa ảnh
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <div className="text-4xl mb-2">📷</div>
                      <p className="text-gray-600 mb-2">Chưa có ảnh</p>
                    </div>
                  )}
                  <Upload
                    name="avatarFile"
                    accept="image/*"
                    beforeUpload={() => false}
                    onChange={handleAvatarChange}
                    maxCount={1}
                  >
                    <Button block>Chọn ảnh</Button>
                  </Upload>
                </div>
              </Form.Item>

              {/* Basic Info */}
              <Form.Item
                label="Tên trại viên"
                name="camperName"
                rules={[{ required: true, message: "Vui lòng nhập tên trại viên" }]}
              >
                <Input placeholder="Nhập tên trại viên" />
              </Form.Item>

              <Form.Item
                label="Giới tính"
                name="gender"
                rules={[{ required: true, message: "Vui lòng chọn giới tính" }]}
              >
                <Select placeholder="Chọn giới tính">
                  <Select.Option value="Nam">Nam</Select.Option>
                  <Select.Option value="Nữ">Nữ</Select.Option>
                  <Select.Option value="Khác">Khác</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="Ngày sinh"
                name="dob"
                rules={[{ required: true, message: "Vui lòng chọn ngày sinh" }]}
              >
                <DatePicker format="DD/MM/YYYY" placeholder="Chọn ngày sinh" className="w-full" />
              </Form.Item>

              {/* Health Record */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h3 className="text-base font-semibold text-gray-900 mb-4">
                  Thông tin sức khỏe (Tùy chọn)
                </h3>

                <Form.Item label="Tình trạng sức khỏe" name="condition">
                  <Input.TextArea placeholder="VD: Hen phế quản, tiểu đường..." rows={2} />
                </Form.Item>

                <Form.Item label="Dị ứng" name="allergies">
                  <Input.TextArea placeholder="VD: Dị ứng với dâu tây..." rows={2} />
                </Form.Item>

                <Form.Item name="isAllergy" valuePropName="checked">
                  <input type="checkbox" /> Trại viên có dị ứng
                </Form.Item>

                <Form.Item label="Ghi chú thêm" name="note">
                  <Input.TextArea placeholder="Các thông tin y tế khác..." rows={2} />
                </Form.Item>
              </div>

              {/* Save/Cancel Buttons */}
              <div className="flex gap-3">
                <Button onClick={() => setIsEditing(false)} className="flex-1">
                  Hủy
                </Button>
                <Button onClick={handleSaveCamper} type="primary" className="flex-1 bg-[#FF8F50] border-[#FF8F50]">
                  Lưu thay đổi
                </Button>
              </div>
            </Form>
          ) : (
            <>
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
                    <p className="text-lg font-semibold text-gray-900">{getGenderDisplay(camper.gender)}</p>
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
            </>
          )}
        </div>
      ),
    },
    {
      key: "guardians",
      label: "Người giám hộ",
      children: (
        <div className="space-y-4">
          {guardians.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-6 text-center border border-gray-200">
              <p className="text-gray-600 mb-4">Chưa có người giám hộ nào</p>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsGuardianModalVisible(true)}
                className="bg-[#FF8F50] border-[#FF8F50]"
              >
                Thêm người giám hộ
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {guardians.map((guardian) => (
                  <div
                    key={guardian.guardianId}
                    className="bg-white p-4 rounded-lg border border-gray-200 flex justify-between items-start"
                  >
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 font-medium mb-1">Họ tên</p>
                      <p className="font-semibold text-gray-900 mb-3">{guardian.fullName}</p>

                      {guardian.title && (
                        <>
                          <p className="text-sm text-gray-600 font-medium mb-1">Mối quan hệ</p>
                          <p className="font-semibold text-gray-900 mb-3">{guardian.title}</p>
                        </>
                      )}

                      {guardian.phoneNumber && (
                        <>
                          <p className="text-sm text-gray-600 font-medium mb-1">Số điện thoại</p>
                          <p className="font-semibold text-gray-900 mb-3">{guardian.phoneNumber}</p>
                        </>
                      )}

                      {guardian.email && (
                        <>
                          <p className="text-sm text-gray-600 font-medium mb-1">Email</p>
                          <p className="font-semibold text-gray-900">{guardian.email}</p>
                        </>
                      )}
                    </div>
                    <DeletePopover
                      onConfirm={() => {
                        handleDeleteGuardian(guardian.guardianId);
                        setDeleteGuardianId(null);
                      }}
                      onCancel={() => setDeleteGuardianId(null)}
                      title="Xóa người giám hộ"
                      message={`Bạn có chắc chắn muốn xóa người giám hộ ${guardian.fullName}?`}
                      confirmText="Xóa"
                      cancelText="Hủy"
                      buttonText="Xóa"
                      isOpen={deleteGuardianId === guardian.guardianId}
                      onOpenChange={(open) => {
                        if (open) {
                          setDeleteGuardianId(guardian.guardianId);
                        } else {
                          setDeleteGuardianId(null);
                        }
                      }}
                    />
                  </div>
                ))}
              </div>

              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsGuardianModalVisible(true)}
                className="w-full bg-[#FF8F50] border-[#FF8F50]"
              >
                Thêm người giám hộ
              </Button>
            </>
          )}
        </div>
      ),
    },
    {
      key: "registrations",
      label: "Trạng thái trại hè",
      children: (
        <div className="space-y-4">
          {camps.length === 0 ? (
            <Empty description="Chưa có trại hè nào" />
          ) : (
            <>
              {/* Camp Dropdown and Navigation */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedCampIndex(Math.max(0, selectedCampIndex - 1))}
                  disabled={selectedCampIndex === 0 || campsLoading}
                  className="h-7.75 w-7.75 bg-[#FF8F50] text-white rounded hover:bg-[#ff7e3d] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  title="Trại hè trước"
                >
                  <ArrowLeftOutlined />
                </button>

                <Select
                  value={selectedCampIndex}
                  onChange={setSelectedCampIndex}
                  className="flex-1"
                  loading={campsLoading}
                  style={{ minWidth: "300px" }}
                >
                  {camps.map((camp, index) => (
                    <Select.Option key={index} value={index}>
                      {camp.camp.name}
                    </Select.Option>
                  ))}
                </Select>

                <button
                  onClick={() => setSelectedCampIndex(Math.min(camps.length - 1, selectedCampIndex + 1))}
                  disabled={selectedCampIndex === camps.length - 1 || campsLoading}
                  className="h-7.75 w-7.75 bg-[#FF8F50] text-white rounded hover:bg-[#ff7e3d] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  title="Trại hè tiếp theo"
                >
                  <ArrowLeftOutlined style={{ transform: "rotate(180deg)" }} />
                </button>
              </div>

              {/* Selected Camp Details */}
              {camps[selectedCampIndex] && (
                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 font-medium mb-1">Tên trại hè</p>
                      <p className="text-lg font-semibold text-gray-900">{camps[selectedCampIndex].camp.name}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 font-medium mb-1">Ngày bắt đầu</p>
                        <p className="text-gray-900 font-medium">
                          {dayjs(camps[selectedCampIndex].camp.startDate).format("DD/MM/YYYY")}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-medium mb-1">Ngày kết thúc</p>
                        <p className="text-gray-900 font-medium">
                          {dayjs(camps[selectedCampIndex].camp.endDate).format("DD/MM/YYYY")}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium mb-1">Nhóm</p>
                      <p className="text-gray-900 font-medium">
                        {camps[selectedCampIndex].camperGroup?.groupName?.groupName || "Chưa phân nhóm"}
                      </p>
                    </div>
                    {camps[selectedCampIndex].status && (
                      <div>
                        <p className="text-sm text-gray-600 font-medium mb-1">Trạng thái trại viên</p>
                        <span className={`inline-block text-sm font-bold px-4 py-1.5 rounded-full ${getStatusInfo(camps[selectedCampIndex].status).bg} ${getStatusInfo(camps[selectedCampIndex].status).text}`}>
                          {getStatusInfo(camps[selectedCampIndex].status).label}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
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
            onClick={() => {
              if (isEditing) {
                setIsEditing(false);
              } else {
                navigate(PagePath.USER_MYCAMPERS);
              }
            }}
            className="flex bg-[#FF8F50] text-white items-center gap-2 hover:text-[#ffffff] font-semibold group px-6 py-2 rounded-full hover:shadow-lg hover:bg-[#ff7e3d] transition-all mb-6"
          >
            <ArrowLeftOutlined className="group-hover:-translate-x-1 transition-transform" />
            <span>{isEditing ? "Hủy chỉnh sửa" : "Quay lại danh sách"}</span>
          </button>
          <h1 className="text-4xl font-bold text-gray-900">Chi tiết trại viên</h1>
        </div>

        {/* Tabs */}
        <Tabs items={tabItems} defaultActiveKey="info" />

        {/* Action Buttons */}
        {!isEditing && (
          <div className="flex flex-wrap gap-3 mt-8 justify-end">
            <button
              onClick={() => setIsEditing(true)}
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
        )}
      </div>

      {/* Guardian Modal */}
      <Modal
        title="Thêm người giám hộ"
        open={isGuardianModalVisible}
        onOk={handleAddGuardian}
        onCancel={() => {
          setIsGuardianModalVisible(false);
          guardianForm.resetFields();
        }}
        okText="Thêm"
        cancelText="Hủy"
        confirmLoading={guardianLoading}
        width={600}
      >
        <Form form={guardianForm} layout="vertical">
          <Form.Item
            label="Tên người giám hộ"
            name="fullName"
            rules={[{ required: true, message: "Vui lòng nhập tên" }]}
          >
            <Input placeholder="Nhập tên người giám hộ" />
          </Form.Item>

          <Form.Item label="Mối quan hệ" name="title">
            <Select placeholder="Chọn mối quan hệ">
              <Select.Option value="Bố">Bố</Select.Option>
              <Select.Option value="Mẹ">Mẹ</Select.Option>
              <Select.Option value="Ông">Ông</Select.Option>
              <Select.Option value="Bà">Bà</Select.Option>
              <Select.Option value="Anh">Anh</Select.Option>
              <Select.Option value="Chị">Chị</Select.Option>
              <Select.Option value="Người giám hộ khác">Người giám hộ khác</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="Giới tính" name="gender">
            <Select placeholder="Chọn giới tính">
              <Select.Option value="Nam">Nam</Select.Option>
              <Select.Option value="Nữ">Nữ</Select.Option>
              <Select.Option value="Khác">Khác</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="Ngày sinh" name="dob">
            <DatePicker format="DD/MM/YYYY" placeholder="Chọn ngày sinh" className="w-full" />
          </Form.Item>

          <Form.Item label="Email" name="email">
            <Input type="email" placeholder="Nhập email" />
          </Form.Item>

          <Form.Item label="Số điện thoại" name="phoneNumber">
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CamperDetail;
