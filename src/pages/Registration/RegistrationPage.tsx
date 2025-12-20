import React, { useState, useEffect } from "react";
import {
  Form,
  Button,
  InputNumber,
  Select,
  Checkbox,
  Input,
  Spin,
  Modal,
  Upload,
  DatePicker,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useParams, Link, useNavigate } from "react-router-dom";
import camperService, {
  type CamperResponseDto,
  type CamperRequestDto,
  type HealthRecordCreateDto,
} from "../../services/camperService";
import registrationService, {
  type CreateRegistrationRequestDto,
} from "../../services/registrationService";
import campService, { type CampResponseDto } from "../../services/campService";
import guardianService, {
  type GuardianResponseDto,
} from "../../services/guardianService";
import { useNotification } from "../../contexts/NotificationContext";
import "./RegistrationPage.css";

const RegistrationPage: React.FC = () => {
  const { campId } = useParams<{ campId: string }>();
  const navigate = useNavigate();
  const { toastSuccess, toastError } = useNotification();
  const [form] = Form.useForm();

  // State for campers
  const [numCampers, setNumCampers] = useState<number>(1);
  const [campers, setCampers] = useState<(CamperResponseDto | null)[]>([null]);
  const [myCampers, setMyCampers] = useState<CamperResponseDto[]>([]);
  const [registrationCampers, setRegistrationCampers] = useState<
    CamperRequestDto[]
  >([]);
  const [selectedCamperIds, setSelectedCamperIds] = useState<(number | null)[]>(
    [null]
  );
  const [guardiansByIndex, setGuardiansByIndex] = useState<
    GuardianResponseDto[][]
  >([[]]);
  const [guardianLoadingByIndex, setGuardianLoadingByIndex] = useState<
    boolean[]
  >([false]);

  // State for camp selection
  const [camps, setCamps] = useState<CampResponseDto[]>([]);
  const [selectedCampId, setSelectedCampId] = useState<number | null>(
    campId ? parseInt(campId) : null
  );
  const [selectedCamp, setSelectedCamp] = useState<CampResponseDto | null>(
    null
  );

  // State for promotions
  const [selectedPromotionId, setSelectedPromotionId] = useState<number | null>(
    null
  );

  // State for terms & conditions
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Loading states
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Modal for new camper registration
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newCamperForm] = Form.useForm();
  const [camperAvatarPreview, setCamperAvatarPreview] = useState<string | null>(
    null
  );

  // Modal for new guardian registration
  const [isGuardianModalVisible, setIsGuardianModalVisible] = useState(false);
  const [newGuardianForm] = Form.useForm();
  const [guardianModalIndex, setGuardianModalIndex] = useState<number | null>(
    null
  );
  const [guardianAdding, setGuardianAdding] = useState(false);
  const [applyToAllCampers, setApplyToAllCampers] = useState(false);

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [campsData, myCampersData] = await Promise.all([
          campService.getCampsByStatus("OpenForRegistration"),
          camperService.getMyCampers(),
        ]);

        setCamps(campsData);
        setMyCampers(myCampersData);

        // Set selected camp if campId from URL
        if (campId) {
          const campIdNum = parseInt(campId);
          setSelectedCampId(campIdNum);
          const selectedCampData = campsData.find(
            (c) => c.campId === campIdNum
          );
          setSelectedCamp(selectedCampData || null);
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
        toastError("Lỗi", "Không thể tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [campId, toastError]);

  // Calculate age from DOB
  const calculateAge = (dob: string): number => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  // Handle number of campers change
  const handleNumCampersChange = (value: number | null) => {
    if (value && value > 0) {
      setNumCampers(value);
      const newCampers = new Array(value).fill(null);
      setCampers(newCampers);
      setRegistrationCampers(new Array(value).fill({}));
      setSelectedCamperIds(new Array(value).fill(null));
      setGuardiansByIndex(new Array(value).fill([]));
      setGuardianLoadingByIndex(new Array(value).fill(false));
    }
  };

  // Handle selecting existing camper
  const handleSelectExistingCamper = async (
    index: number,
    camperId: number | null | undefined
  ) => {
    if (!camperId) {
      // Clear selection
      const newCampers = [...campers];
      newCampers[index] = null;
      setCampers(newCampers);

      const newSelectedIds = [...selectedCamperIds];
      newSelectedIds[index] = null;
      setSelectedCamperIds(newSelectedIds);

      const newRegistrationCampers = [...registrationCampers];
      newRegistrationCampers[index] = {
        camperName: "",
        gender: "",
        dob: "",
      };
      setRegistrationCampers(newRegistrationCampers);

      const newGuardians = [...guardiansByIndex];
      newGuardians[index] = [];
      setGuardiansByIndex(newGuardians);
      return;
    }

    try {
      // Set loading state immediately
      setGuardianLoadingByIndex((prev) => {
        const newLoading = [...prev];
        newLoading[index] = true;
        return newLoading;
      });

      // Fetch camper data first (required)
      const selectedCamper = await camperService.getCamperById(camperId);

      // Update camper info immediately (don't block on guardian fetch error)
      setCampers((prev) => {
        const newCampers = [...prev];
        newCampers[index] = selectedCamper;
        return newCampers;
      });

      setSelectedCamperIds((prev) => {
        const newSelectedIds = [...prev];
        newSelectedIds[index] = camperId;
        return newSelectedIds;
      });

      setRegistrationCampers((prev) => {
        const newRegistrationCampers = [...prev];
        newRegistrationCampers[index] = {
          camperName: selectedCamper.camperName,
          gender: selectedCamper.gender,
          dob: selectedCamper.dob,
        };
        return newRegistrationCampers;
      });

      // Try to fetch guardians, but don't fail if error
      try {
        const camperGuardiansResponse = await camperService.getCamperGuardians(
          camperId
        );
        const guardiansList =
          camperGuardiansResponse.length > 0
            ? camperGuardiansResponse[0]?.guardians || []
            : [];

        const camperGuardians: GuardianResponseDto[] = guardiansList.map(
          (g) => ({
            guardianId: g.guardianId,
            camperId: camperId,
            userId: 0,
            fullName: g.fullName,
            title: g.title,
            gender: g.gender,
            dob: undefined,
            email: g.email || undefined,
            phoneNumber: g.phoneNumber || undefined,
            isActive: true,
          })
        );

        setGuardiansByIndex((prev) => {
          const newGuardians = [...prev];
          newGuardians[index] = camperGuardians;
          return newGuardians;
        });
      } catch (guardianError) {
        console.error("Error fetching guardians:", guardianError);
        // Initialize empty guardians list if fetch fails
        setGuardiansByIndex((prev) => {
          const newGuardians = [...prev];
          newGuardians[index] = [];
          return newGuardians;
        });
      }

      // Clear loading state
      setGuardianLoadingByIndex((prev) => {
        const newLoading = [...prev];
        newLoading[index] = false;
        return newLoading;
      });
    } catch (error) {
      console.error("Error fetching camper details:", error);
      toastError("Lỗi", "Không thể tải thông tin trại viên");

      // Clear loading state and reset selections on critical error
      setGuardianLoadingByIndex((prev) => {
        const newLoading = [...prev];
        newLoading[index] = false;
        return newLoading;
      });

      // Reset this camper selection on error
      setSelectedCamperIds((prev) => {
        const newSelectedIds = [...prev];
        newSelectedIds[index] = null;
        return newSelectedIds;
      });

      setCampers((prev) => {
        const newCampers = [...prev];
        newCampers[index] = null;
        return newCampers;
      });

      setGuardiansByIndex((prev) => {
        const newGuardians = [...prev];
        newGuardians[index] = [];
        return newGuardians;
      });
    }
  };

  // Handle register new camper modal
  const showNewCamperModal = () => {
    setIsModalVisible(true);
  };

  const handleNewCamperOk = async () => {
    try {
      const values = await newCamperForm.validateFields();

      // Convert DatePicker value to string format (YYYY-MM-DD)
      let dobValue = "";
      if (values.dob) {
        // Check if it's a dayjs object or string
        if (typeof values.dob === "string") {
          dobValue = values.dob;
        } else if (values.dob.format) {
          // It's a dayjs object
          dobValue = values.dob.format("YYYY-MM-DD");
        }
      }

      // Build health record if any fields are provided
      const healthRecord: HealthRecordCreateDto | undefined =
        values.condition ||
          values.allergies ||
          values.isAllergy !== undefined ||
          values.healthNote
          ? {
            condition: values.condition || undefined,
            allergies: values.allergies || undefined,
            isAllergy: values.isAllergy || undefined,
            note: values.healthNote || undefined,
          }
          : undefined;

      const newCamperData: CamperRequestDto = {
        camperName: values.camperName,
        gender: values.gender,
        dob: dobValue,
        healthRecord,
      };

      // Call API to create camper
      const createdCamper = await camperService.createCamper(newCamperData);

      // Upload avatar separately if provided
      if (values.avatarFile) {
        await camperService.uploadCamperAvatar(
          createdCamper.camperId,
          values.avatarFile as File
        );
      }

      // Add the newly created camper to the dropdown list immediately
      setMyCampers((prevMyCampers) => [...prevMyCampers, createdCamper]);

      setIsModalVisible(false);
      newCamperForm.resetFields();
      setCamperAvatarPreview(null);
      toastSuccess("Thành công", "Tạo trại viên mới thành công!");
    } catch (error) {
      console.error("Error creating new camper:", error);
      toastError("Lỗi", "Không thể tạo trại viên mới");
    }
  };

  const handleNewCamperCancel = () => {
    setIsModalVisible(false);
    newCamperForm.resetFields();
    setCamperAvatarPreview(null);
  };

  // Handle camper avatar upload
  const handleCamperAvatarChange = (info: any) => {
    const file = info.file;

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setCamperAvatarPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Store the actual file in form for upload
    newCamperForm.setFieldValue("avatarFile", file);
  };

  // Show guardian modal
  const showGuardianModal = (index: number) => {
    setGuardianModalIndex(index);
    setIsGuardianModalVisible(true);
  };

  // Handle add guardian
  const handleAddGuardian = async () => {
    try {
      if (guardianModalIndex === null) return;

      const values = await newGuardianForm.validateFields();

      // Convert DOB to YYYY-MM-DD format
      let dobValue = "";
      if (values.dob) {
        if (typeof values.dob === "string") {
          dobValue = values.dob;
        } else if (values.dob.format) {
          dobValue = values.dob.format("YYYY-MM-DD");
        }
      }

      const guardianData = {
        fullName: values.fullName || undefined,
        title: values.title || undefined,
        gender: values.gender || undefined,
        dob: dobValue || undefined,
        email: values.email || undefined,
        phoneNumber: values.phoneNumber || undefined,
      };

      setGuardianAdding(true);

      if (applyToAllCampers) {
        // Apply to all selected campers - gọi API lần lượt cho từng camper
        const newGuardians = [...guardiansByIndex];
        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < selectedCamperIds.length; i++) {
          const camperId = selectedCamperIds[i];
          if (camperId) {
            try {
              const newGuardian = await guardianService.createGuardianForCamper(
                camperId,
                guardianData
              );
              newGuardians[i] = [...newGuardians[i], newGuardian];
              successCount++;
            } catch (error) {
              console.error(`Error adding guardian to camper ${i + 1}:`, error);
              failCount++;
            }
          }
        }
        setGuardiansByIndex(newGuardians);

        if (failCount === 0) {
          toastSuccess(
            "Thành công",
            `Thêm người giám hộ cho ${successCount} trại viên thành công!`
          );
        } else if (successCount === 0) {
          toastError(
            "Lỗi",
            `Không thể thêm người giám hộ cho ${failCount} trại viên`
          );
        } else {
          toastSuccess(
            "Thành công",
            `Thêm người giám hộ cho ${successCount} trại viên, ${failCount} trại viên thất bại`
          );
        }
      } else {
        // Apply to single camper
        const camperId = selectedCamperIds[guardianModalIndex];

        if (!camperId) {
          toastError("Lỗi", "Vui lòng chọn trại viên trước");
          setGuardianAdding(false);
          return;
        }

        const newGuardian = await guardianService.createGuardianForCamper(
          camperId,
          guardianData
        );

        // Update guardians list
        const newGuardians = [...guardiansByIndex];
        newGuardians[guardianModalIndex] = [
          ...newGuardians[guardianModalIndex],
          newGuardian,
        ];
        setGuardiansByIndex(newGuardians);
        toastSuccess("Thành công", "Thêm người giám hộ thành công!");
      }

      setIsGuardianModalVisible(false);
      newGuardianForm.resetFields();
      setApplyToAllCampers(false);
    } catch (error) {
      console.error("Error adding guardian:", error);
      toastError("Lỗi", "Không thể thêm người giám hộ");
    } finally {
      setGuardianAdding(false);
    }
  };

  // Handle cancel guardian modal
  const handleGuardianCancel = () => {
    setIsGuardianModalVisible(false);
    newGuardianForm.resetFields();
  };

  // Handle delete guardian
  const handleDeleteGuardian = async (index: number, guardianId: number) => {
    try {
      await guardianService.deleteGuardian(guardianId);

      // Remove guardian from list
      const newGuardians = [...guardiansByIndex];
      newGuardians[index] = newGuardians[index].filter(
        (g) => g.guardianId !== guardianId
      );
      setGuardiansByIndex(newGuardians);

      toastSuccess("Thành công", "Xoá người giám hộ thành công!");
    } catch (error) {
      console.error("Error deleting guardian:", error);
      toastError("Lỗi", "Không thể xoá người giám hộ");
    }
  };

  // Handle camp selection
  const handleCampChange = (value: number) => {
    setSelectedCampId(value);
    const camp = camps.find((c) => c.campId === value);
    setSelectedCamp(camp || null);
  };

  // Calculate total price
  const calculateTotalPrice = () => {
    if (!selectedCamp) return 0;
    let total = selectedCamp.price * numCampers;
    if (selectedPromotionId && selectedCamp.promotion) {
      const discount = (total * selectedCamp.promotion.percent) / 100;
      total -= Math.min(
        discount,
        selectedCamp.promotion.maxDiscountAmount || 0
      );
    }
    return total;
  };

  // Handle registration submission
  const handleSubmit = async () => {
    if (!selectedCampId) {
      toastError("Lỗi", "Vui lòng chọn trại hè");
      return;
    }

    if (!agreeTerms) {
      toastError("Lỗi", "Vui lòng đồng ý với quy định");
      return;
    }

    if (registrationCampers.some((c) => !c.camperName)) {
      toastError("Lỗi", "Vui lòng điền đầy đủ thông tin tất cả trại viên");
      return;
    }

    // Check if all campers have avatars
    const campersWithoutAvatar = campers
      .map((c, index) => ({ camper: c, index }))
      .filter(({ camper }) => camper && !camper.avatar);

    if (campersWithoutAvatar.length > 0) {
      const camperNames = campersWithoutAvatar
        .map(({ camper }) => camper?.camperName)
        .join(", ");
      toastError(
        "Thiếu ảnh đại diện",
        `Vui lòng vào trang Quản lý trại viên để upload ảnh cho: ${camperNames}`
      );
      return;
    }

    try {
      setSubmitting(true);

      // Get camper IDs for existing campers
      const camperIds = campers
        .map((c) => c?.camperId)
        .filter((id) => id && id !== 0) as number[];

      const registrationData: CreateRegistrationRequestDto = {
        camperIds: camperIds.length > 0 ? camperIds : null,
        campId: selectedCampId,
        appliedPromotionId: selectedPromotionId || null,
        note: form.getFieldValue("note") || null,
      };

      const result = await registrationService.createRegistration(
        registrationData
      );
      toastSuccess(
        "Thành công",
        "Đăng ký đã được gửi phê duyệt! Vui lòng chờ xác nhận từ trại hè."
      );

      // Reset form and redirect
      form.resetFields();
      console.log("Registration submitted for approval:", result);

      // Navigate to my registrations page
      navigate("/user/my-registrations");
    } catch (error: any) {
      console.error("Error creating registration:", error);
      const errorMessage = error.response?.data?.message || error.response?.data?.title || "Không thể tạo đăng ký";
      toastError("Lỗi", errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const REGULATIONS = [
    "Đối với các lớp trại hè không đủ số lượng trại viên đăng ký để mở lớp (tối thiểu từ 10 trại viên/ lớp tuỳ từng trại hè), nhà trường sẽ hoàn lại phí hè Phụ huynh đã đóng cho trại viên",
    "Nhà trường chỉ xếp lớp khi đã tiếp nhận đầy đủ đăng ký và khoản phí theo yêu cầu",
    "Trại viên khi mắc bệnh truyền nhiễm phải được nghỉ ở nhà, Phụ huynh cần nộp cho nhà trường giấy khám sức khỏe khi trại viên đi học lại",
    "Phụ huynh ủy quyền cho nhà trường trong trường hợp trại viên cần cấp cứu y khoa, nhà trường sẽ đưa trại viên đến Bệnh viện có đủ khả năng cấp cứu gần nhất. Phụ huynh vui lòng thanh toán hoặc hoàn trả cho nhà trường các chi phí thăm khám và điều trị cho trại viên",
    "Nhà trường sẽ tổ chức chụp ảnh, ghi hình các hoạt động của trại viên khi tham gia chương trình và có quyền sử dụng các hình ảnh này vào mục đích liên quan đến hoạt động giáo dục và quảng bá của trường",
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <>
      <div className="registration-page min-h-screen bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            Đăng ký trại hè
          </h1>

          <Form form={form} layout="vertical" className="space-y-8">
            {/* Step 1: Registration Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                1. Thông tin đăng ký
              </h2>

              {/* Select Number of Campers */}
              <div className="mb-8 pb-1 border-b border-gray-200">
                <Form.Item
                  label="Số lượng trại viên cần đăng ký"
                  name="numCampers"
                  initialValue={1}
                  rules={[
                    { required: true, message: "Vui lòng chọn số lượng" },
                  ]}
                >
                  <InputNumber
                    min={1}
                    max={20}
                    value={numCampers}
                    onChange={handleNumCampersChange}
                    className="w-full"
                  />
                </Form.Item>
              </div>

              {/* Camper Information */}
              {numCampers && (
                <div className="space-y-6">
                  {Array.from({ length: numCampers }).map((_, index) => (
                    <div
                      key={index}
                      className="border-l-4 border-[#FF8F50] pl-6 pr-6 py-4 bg-gray-50 rounded"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Trại viên {index + 1}
                      </h3>

                      <div className="mb-4 flex gap-4">
                        <Select
                          placeholder="Chọn trại viên đã có"
                          allowClear
                          optionLabelProp="label"
                          value={selectedCamperIds[index]}
                          onChange={(value) =>
                            handleSelectExistingCamper(index, value)
                          }
                          className="flex-1"
                        >
                          {myCampers
                            .filter(
                              (camper) =>
                                // Show camper if: not selected OR is currently selected in this index
                                !selectedCamperIds.includes(camper.camperId) ||
                                selectedCamperIds[index] === camper.camperId
                            )
                            .map((camper) => (
                              <Select.Option
                                key={camper.camperId}
                                value={camper.camperId}
                                label={camper.camperName}
                              >
                                <div className="flex items-center gap-2">
                                  {camper.avatar && (
                                    <img
                                      src={camper.avatar}
                                      alt={camper.camperName}
                                      className="w-6 h-6 rounded object-cover"
                                    />
                                  )}
                                  <span>{camper.camperName}</span>
                                </div>
                              </Select.Option>
                            ))}
                        </Select>
                        <Button
                          type="primary"
                          icon={<PlusOutlined />}
                          onClick={() => showNewCamperModal()}
                          className="bg-[#FF8F50] border-[#FF8F50] whitespace-nowrap"
                        >
                          Đăng ký mới
                        </Button>
                      </div>

                      {campers[index] && (
                        <div className="mb-4 p-4 bg-white rounded border border-gray-200">
                          {/* Warning for missing avatar */}
                          {!campers[index]?.avatar && (
                            <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 rounded">
                              <div className="flex items-start gap-3">
                                <span className="text-2xl">⚠️</span>
                                <div className="flex-1">
                                  <p className="text-sm font-bold text-red-800 mb-1">
                                    Yêu cầu bổ sung ảnh đại diện (Bắt buộc)
                                  </p>
                                  <p className="text-xs text-red-700">
                                    Trại viên <span className="font-semibold">{campers[index]?.camperName}</span> chưa có ảnh đại diện.
                                    Vui lòng vào trang <Link to="/user/my-campers" className="font-semibold text-red-800 underline hover:text-red-900">Quản lý trại viên</Link> để upload ảnh trước khi đăng ký.
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="flex gap-4 mb-4">
                            {campers[index]?.avatar ? (
                              <img
                                src={campers[index]?.avatar}
                                alt={campers[index]?.camperName}
                                className="w-23 h-26 rounded-lg object-cover border border-gray-300"
                              />
                            ) : (
                              <div className="w-23 h-26 rounded-lg border-2 border-dashed border-red-400 bg-red-50 flex flex-col items-center justify-center">
                                <div className="text-3xl mb-1">📷</div>
                                <p className="text-xs text-red-600 font-semibold text-center px-2">Thiếu ảnh</p>
                              </div>
                            )}
                            <div className="flex-1 grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-gray-600">
                                  Tên trại viên
                                </p>
                                <p className="font-semibold text-gray-900">
                                  {campers[index]?.camperName}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">
                                  Giới tính
                                </p>
                                <p className="font-semibold text-gray-900">
                                  {campers[index]?.gender}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">
                                  Ngày sinh
                                </p>
                                <p className="font-semibold text-gray-900">
                                  {campers[index]?.dob}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Độ tuổi</p>
                                <p className="font-semibold text-gray-900">
                                  {calculateAge(campers[index]?.dob || "")} tuổi
                                </p>
                              </div>
                            </div>
                          </div>

                          {campers[index]?.healthRecord && (
                            <div className="border-t border-gray-200 pt-3 mt-3">
                              <p className="text-sm font-semibold text-gray-600 mb-2">
                                Thông tin sức khỏe
                              </p>
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                {campers[index]?.healthRecord?.condition && (
                                  <div>
                                    <p className="text-gray-600">Tình trạng</p>
                                    <p className="font-semibold text-gray-900">
                                      {campers[index]?.healthRecord?.condition}
                                    </p>
                                  </div>
                                )}
                                {campers[index]?.healthRecord?.allergies && (
                                  <div>
                                    <p className="text-gray-600">Dị ứng</p>
                                    <p className="font-semibold text-gray-900">
                                      {campers[index]?.healthRecord?.allergies}
                                    </p>
                                  </div>
                                )}
                                {campers[index]?.healthRecord?.note && (
                                  <div className="col-span-2">
                                    <p className="text-gray-600">Ghi chú</p>
                                    <p className="font-semibold text-gray-900">
                                      {campers[index]?.healthRecord?.note}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Step 2: Guardian Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                2. Thông tin người giám hộ
              </h2>

              {/* Show guardians for each camper */}
              {campers.map((camper, index) => {
                const selectedCamperId = selectedCamperIds[index];
                const guardians = guardiansByIndex[index] || [];
                const isLoading = guardianLoadingByIndex[index] || false;

                if (!selectedCamperId) {
                  return null;
                }

                return (
                  <div key={index} className="mb-6">
                    {/* Camper Name as Header */}
                    <div className="mb-4">
                      <h3 className="text-lg font-bold text-gray-900">
                        {index + 1}. {camper?.camperName}
                      </h3>
                    </div>

                    {/* Guardians List */}
                    {isLoading ? (
                      <div className="flex justify-center items-center h-32">
                        <Spin size="large" />
                      </div>
                    ) : guardians.length === 0 ? (
                      <div className="p-4 bg-yellow-50 rounded border border-yellow-200 mb-4">
                        <p className="text-sm text-yellow-800">
                          Chưa có người giám hộ nào.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3 mb-4">
                        {guardians.map((guardian) => (
                          <div
                            key={guardian.guardianId}
                            className="p-3 bg-gray-50 rounded border border-gray-200 flex justify-between items-start"
                          >
                            <div className="flex-1 grid grid-cols-3 gap-x-4 gap-y-2">
                              <div>
                                <p className="text-xs text-gray-500 mb-0.5">Họ tên</p>
                                <p className="text-sm font-semibold text-gray-900">
                                  {guardian.fullName || "Không có"}
                                </p>
                              </div>
                              {guardian.title && (
                                <div>
                                  <p className="text-xs text-gray-500 mb-0.5">Mối quan hệ</p>
                                  <p className="text-sm font-semibold text-gray-900">
                                    {guardian.title}
                                  </p>
                                </div>
                              )}
                              {guardian.gender && (
                                <div>
                                  <p className="text-xs text-gray-500 mb-0.5">Giới tính</p>
                                  <p className="text-sm font-semibold text-gray-900">
                                    {guardian.gender}
                                  </p>
                                </div>
                              )}
                              {guardian.phoneNumber && (
                                <div>
                                  <p className="text-xs text-gray-500 mb-0.5">Số điện thoại</p>
                                  <p className="text-sm font-semibold text-gray-900">
                                    {guardian.phoneNumber}
                                  </p>
                                </div>
                              )}
                              {guardian.email && (
                                <div>
                                  <p className="text-xs text-gray-500 mb-0.5">Email</p>
                                  <p className="text-sm font-semibold text-gray-900 truncate">
                                    {guardian.email}
                                  </p>
                                </div>
                              )}
                              {guardian.dob && (
                                <div>
                                  <p className="text-xs text-gray-500 mb-0.5">Ngày sinh</p>
                                  <p className="text-sm font-semibold text-gray-900">
                                    {new Date(guardian.dob).toLocaleDateString('vi-VN')}
                                  </p>
                                </div>
                              )}
                            </div>
                            <Button
                              danger
                              size="small"
                              onClick={() =>
                                handleDeleteGuardian(index, guardian.guardianId)
                              }
                              className="ml-2"
                            >
                              ✕
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Guardian Button */}
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => showGuardianModal(index)}
                      className="w-full"
                    >
                      Thêm người giám hộ
                    </Button>

                    {/* Divider */}
                    {index < campers.length - 1 && (
                      <div className="border-t border-gray-200 my-6"></div>
                    )}
                  </div>
                );
              })}

              {/* No campers selected message */}
              {campers.every(
                (camper) => !selectedCamperIds[campers.indexOf(camper)]
              ) && (
                  <div className="p-4 bg-blue-50 rounded border border-blue-200">
                    <p className="text-sm text-blue-800">
                      ℹ️ Vui lòng chọn trại viên.
                    </p>
                  </div>
                )}
            </div>

            {/* Step 3: Select Camp */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                3. Chọn trại hè
              </h2>
              <Form.Item
                label="Trại hè"
                name="campId"
                initialValue={selectedCampId}
                rules={[{ required: true, message: "Vui lòng chọn trại hè" }]}
              >
                <Select
                  placeholder="Chọn trại hè"
                  onChange={handleCampChange}
                  optionLabelProp="label"
                >
                  {camps.map((camp) => (
                    <Select.Option
                      key={camp.campId}
                      value={camp.campId}
                      label={camp.name}
                    >
                      <div>
                        <p className="font-semibold">{camp.name}</p>
                        <p className="text-sm text-gray-500">
                          {camp.description}
                        </p>
                      </div>
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              {selectedCamp && (
                <div className="p-4 bg-gray-50 rounded border border-gray-200 mt-4">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {selectedCamp.name}
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Địa điểm</p>
                      <p className="font-semibold text-gray-900">
                        {selectedCamp.place}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Độ tuổi</p>
                      <p className="font-semibold text-gray-900">
                        {selectedCamp.minAge} - {selectedCamp.maxAge} tuổi
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Giá tiền</p>
                      <p className="font-semibold text-gray-900">
                        {selectedCamp.price?.toLocaleString()} VNĐ
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Trạng thái</p>
                      <p className="font-semibold text-gray-900">
                        {selectedCamp.status}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Step 4: Summary & Promotion */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                4. Chi tiết thanh toán
              </h2>

              <Form.Item label="Áp dụng mã khuyến mãi" name="promotionId">
                <Select
                  placeholder="Chọn mã khuyến mãi (tùy chọn)"
                  allowClear
                  onChange={setSelectedPromotionId}
                  disabled={!selectedCamp || !selectedCamp.promotion}
                >
                  {selectedCamp && selectedCamp.promotion && (
                    <Select.Option
                      key={selectedCamp.promotion.id}
                      value={selectedCamp.promotion.id}
                    >
                      {selectedCamp.promotion.name} -{" "}
                      {selectedCamp.promotion.percent}% Off (Max:{" "}
                      {selectedCamp.promotion.maxDiscountAmount?.toLocaleString()}{" "}
                      VNĐ)
                    </Select.Option>
                  )}
                </Select>
              </Form.Item>

              <Form.Item label="Ghi chú" name="note">
                <Input.TextArea
                  placeholder="Thêm ghi chú (tùy chọn)"
                  rows={3}
                />
              </Form.Item>

              {selectedCamp && (
                <div className="bg-gray-50 rounded p-4 border border-gray-200">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-700">
                      Giá cơ bản ({numCampers} trại viên)
                    </span>
                    <span className="font-semibold">
                      {(selectedCamp.price * numCampers).toLocaleString()} VNĐ
                    </span>
                  </div>
                  {selectedPromotionId && (
                    <div className="flex justify-between mb-2 text-red-600">
                      <span>Chiết khấu</span>
                      <span className="font-semibold">
                        -
                        {(
                          selectedCamp.price * numCampers -
                          calculateTotalPrice()
                        ).toLocaleString()}{" "}
                        VNĐ
                      </span>
                    </div>
                  )}
                  <div className="border-t border-gray-300 pt-2 flex justify-between">
                    <span className="text-lg font-bold text-gray-900">
                      Tổng cộng
                    </span>
                    <span className="text-2xl font-bold text-[#FF8F50]">
                      {calculateTotalPrice().toLocaleString()} VNĐ
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Step 5: Regulations & Agreement */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                5. Quy định & Đồng ý
              </h2>

              <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">
                  📋 Quy định của nhà trường
                </h3>
                <ul className="space-y-3">
                  {REGULATIONS.map((reg, index) => (
                    <li key={index} className="flex gap-3">
                      <span className="text-[#FF8F50] font-bold flex-shrink-0">
                        •
                      </span>
                      <span className="text-sm text-gray-700">{reg}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Form.Item
                name="agreeTerms"
                valuePropName="checked"
                rules={[
                  {
                    validator: (_, value) =>
                      value
                        ? Promise.resolve()
                        : Promise.reject(
                          new Error("Vui lòng đồng ý với quy định")
                        ),
                  },
                ]}
              >
                <Checkbox onChange={(e) => setAgreeTerms(e.target.checked)}>
                  <span className="text-gray-700">
                    Tôi đã đọc và đồng ý với tất cả các quy định trên
                  </span>
                </Checkbox>
              </Form.Item>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <Button className="flex-1" size="large">
                Hủy
              </Button>
              <Button
                type="primary"
                size="large"
                loading={submitting}
                disabled={!agreeTerms}
                onClick={handleSubmit}
                className="flex-1 bg-[#FF8F50] border-[#FF8F50] h-12 text-lg font-bold"
              >
                Gửi đăng ký
              </Button>
            </div>
          </Form>
        </div>

        {/* Modal for New Camper Registration */}
        <Modal
          title="Đăng ký trại viên mới"
          open={isModalVisible}
          onOk={handleNewCamperOk}
          onCancel={handleNewCamperCancel}
          okText="Thêm"
          cancelText="Hủy"
          width={700}
        >
          <Form form={newCamperForm} layout="vertical">
            <Form.Item
              label="Tên trại viên"
              name="camperName"
              rules={[
                { required: true, message: "Vui lòng nhập tên trại viên" },
              ]}
            >
              <Input placeholder="Nhập tên trại viên" />
            </Form.Item>

            <Form.Item
              label="Giới tính"
              name="gender"
              rules={[{ required: true, message: "Vui lòng chọn giới tính" }]}
            >
              <Select placeholder="Chọn giới tính">
                <Select.Option value="Male">Nam</Select.Option>
                <Select.Option value="Female">Nữ</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Ngày sinh"
              name="dob"
              rules={[{ required: true, message: "Vui lòng chọn ngày sinh" }]}
            >
              <DatePicker
                format="DD/MM/YYYY"
                placeholder="Chọn ngày sinh"
                className="w-full"
              />
            </Form.Item>

            <Form.Item
              label="Ảnh đại diện"
              name="avatarFile"
              rules={[
                { required: true, message: "Vui lòng chọn ảnh đại diện" },
              ]}
            >
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
                        newCamperForm.setFieldValue("avatarFile", undefined);
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
                  onChange={handleCamperAvatarChange}
                  maxCount={1}
                >
                  <Button block>Chọn ảnh</Button>
                </Upload>
              </div>
            </Form.Item>

            {/* Health Record Section */}
            <div className="border-t border-gray-200 pt-4 mt-4">
              <h3 className="text-base font-semibold text-gray-900 mb-4">
                Thông tin sức khỏe (Tùy chọn)
              </h3>

              <Form.Item label="Tình trạng sức khỏe" name="condition">
                <Input.TextArea
                  placeholder="VD: Hen phế quản, tiểu đường, v.v..."
                  rows={2}
                />
              </Form.Item>

              <Form.Item label="Dị ứng" name="allergies">
                <Input.TextArea
                  placeholder="VD: Dị ứng với dâu tây, các loại cá, v.v..."
                  rows={2}
                />
              </Form.Item>

              <Form.Item name="isAllergy" valuePropName="checked">
                <Checkbox>Trại viên có dị ứng</Checkbox>
              </Form.Item>

              <Form.Item label="Ghi chú thêm" name="healthNote">
                <Input.TextArea
                  placeholder="Các thông tin y tế khác cần lưu ý..."
                  rows={2}
                />
              </Form.Item>
            </div>
          </Form>
        </Modal>

        {/* Modal for New Guardian Registration */}
        <Modal
          title="Thêm người giám hộ"
          open={isGuardianModalVisible}
          onOk={handleAddGuardian}
          onCancel={handleGuardianCancel}
          okText="Thêm"
          cancelText="Hủy"
          confirmLoading={guardianAdding}
          width={600}
        >
          <Form form={newGuardianForm} layout="vertical">
            {/* Camper Name Display */}
            {guardianModalIndex !== null && (
              <div className="mb-4">
                <p className="text-sm font-bold text-gray-900">
                  Trại viên: {campers[guardianModalIndex]?.camperName}
                </p>
              </div>
            )}

            {/* Apply to All Campers Switch */}
            <Form.Item label="Áp dụng cho tất cả trại viên" className="mb-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={applyToAllCampers}
                  onChange={(e) => setApplyToAllCampers(e.target.checked)}
                >
                  <span className="text-sm text-gray-700">
                    Thêm người giám hộ này cho tất cả trại viên
                  </span>
                </Checkbox>
              </div>
            </Form.Item>

            <Form.Item
              label="Tên người giám hộ"
              name="fullName"
              rules={[
                { required: true, message: "Vui lòng nhập tên người giám hộ" },
              ]}
            >
              <Input placeholder="Nhập tên người giám hộ" />
            </Form.Item>

            <Form.Item label="Chức danh" name="title">
              <Select placeholder="Chọn chức danh">
                <Select.Option value="Bố">Bố</Select.Option>
                <Select.Option value="Mẹ">Mẹ</Select.Option>
                <Select.Option value="Ông">Ông</Select.Option>
                <Select.Option value="Bà">Bà</Select.Option>
                <Select.Option value="Anh">Anh</Select.Option>
                <Select.Option value="Chị">Chị</Select.Option>
                <Select.Option value="Người giám hộ khác">
                  Người giám hộ khác
                </Select.Option>
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
              <DatePicker
                format="DD/MM/YYYY"
                placeholder="Chọn ngày sinh"
                className="w-full"
              />
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
    </>
  );
};

export default RegistrationPage;
