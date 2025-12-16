import React, { useState, useEffect, useCallback } from "react";
import { Modal, Form, Select, Input, Spin, Button } from "antd";
import { useNotification } from "../../../contexts/NotificationContext";
import registrationService, {
  type RegistrationResponseDto,
  type UpdateRegistrationRequestDto,
} from "../../../services/registrationService";
import camperService, { type CamperResponseDto } from "../../../services/camperService";
import promotionService, { type PromotionResponseDto } from "../../../services/promotionService";
import { type GuardianResponseDto } from "../../../services/guardianService";

interface EditRegistrationModalProps {
  visible: boolean;
  registration: RegistrationResponseDto | null;
  onClose: () => void;
  onSuccess: () => void;
}

const EditRegistrationModal: React.FC<EditRegistrationModalProps> = ({
  visible,
  registration,
  onClose,
  onSuccess,
}) => {
  const { toastSuccess, toastError } = useNotification();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Data states
  const [myCampers, setMyCampers] = useState<CamperResponseDto[]>([]);
  const [promotions, setPromotions] = useState<PromotionResponseDto[]>([]);
  const [selectedCamperIds, setSelectedCamperIds] = useState<number[]>([]);
  const [guardiansByIndex, setGuardiansByIndex] = useState<GuardianResponseDto[][]>([]);
  const [guardianLoadingByIndex, setGuardianLoadingByIndex] = useState<boolean[]>([]);

  const loadGuardiansForCampers = useCallback(async (camperIds: number[]) => {
    const guardiansPromises = camperIds.map(async (camperId, index) => {
      try {
        setGuardianLoadingByIndex(prev => {
          const newLoading = [...prev];
          newLoading[index] = true;
          return newLoading;
        });

        const camperGuardiansResponse = await camperService.getCamperGuardians(camperId);
        const guardiansList = camperGuardiansResponse.length > 0
          ? camperGuardiansResponse[0]?.guardians || []
          : [];

        const camperGuardians: GuardianResponseDto[] = guardiansList.map(g => ({
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
        }));

        setGuardiansByIndex(prev => {
          const newGuardians = [...prev];
          newGuardians[index] = camperGuardians;
          return newGuardians;
        });
      } catch {
        setGuardiansByIndex(prev => {
          const newGuardians = [...prev];
          newGuardians[index] = [];
          return newGuardians;
        });
      } finally {
        setGuardianLoadingByIndex(prev => {
          const newLoading = [...prev];
          newLoading[index] = false;
          return newLoading;
        });
      }
    });

    await Promise.all(guardiansPromises);
  }, []);

  const loadData = useCallback(async () => {
    if (!registration) return;

    try {
      setLoading(true);
      const [campersData, promotionsData] = await Promise.all([
        camperService.getMyCampers(),
        promotionService.getAllPromotions(),
      ]);
      
      setMyCampers(campersData);
      setPromotions(promotionsData.filter(p => p.status === "Active"));

      // Set initial camper IDs
      const initialCamperIds = registration.campers?.map(c => c.camperId) || [];
      setSelectedCamperIds(initialCamperIds);
      
      // Initialize guardians arrays
      setGuardiansByIndex(new Array(initialCamperIds.length).fill([]));
      setGuardianLoadingByIndex(new Array(initialCamperIds.length).fill(false));

      // Load guardians for each camper
      await loadGuardiansForCampers(initialCamperIds);

      // Set form values
      form.setFieldsValue({
        camperIds: initialCamperIds,
        appliedPromotionId: registration.appliedPromotion?.promotionId || null,
        note: registration.note || "",
      });
    } catch {
      toastError("Lỗi", "Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, [registration, form, loadGuardiansForCampers, toastError]);

  useEffect(() => {
    if (visible && registration) {
      loadData();
    }
  }, [visible, registration, loadData]);

  const handleCamperIdsChange = async (value: number[]) => {
    setSelectedCamperIds(value);
    
    // Reset and reload guardians for new selection
    setGuardiansByIndex(new Array(value.length).fill([]));
    setGuardianLoadingByIndex(new Array(value.length).fill(false));
    
    if (value.length > 0) {
      await loadGuardiansForCampers(value);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      if (!registration) return;

      const updateData: UpdateRegistrationRequestDto = {
        campId: registration.camp.campId,
        camperIds: values.camperIds || [],
        appliedPromotionId: values.appliedPromotionId || null,
        note: values.note || null,
      };

      await registrationService.updateRegistration(
        registration.registrationId,
        updateData
      );

      toastSuccess("Thành công", "Cập nhật đơn đăng ký thành công. Đơn đã được gửi lại để chờ duyệt.");
      form.resetFields();
      onSuccess();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Không thể cập nhật đơn đăng ký";
      toastError("Lỗi", errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  const getCamperById = (camperId: number) => {
    return myCampers.find(c => c.camperId === camperId);
  };

  return (
    <Modal
      title={
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Chỉnh sửa đơn đăng ký</h2>
          <p className="text-sm text-gray-600 mt-1">
            Cập nhật thông tin và gửi lại để được duyệt
          </p>
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel} disabled={submitting}>
          Hủy
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handleSubmit}
          loading={submitting}
          className="bg-[#FF8F50] hover:bg-[#ff7e3d]"
        >
          Cập nhật & Gửi lại
        </Button>,
      ]}
      width={900}
      centered
    >
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Spin size="large" />
        </div>
      ) : (
        <Form form={form} layout="vertical" className="mt-4">
          {/* Reject Reason Display */}
          {registration?.rejectReason && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm font-semibold text-red-900 mb-1">
                Lý do từ chối:
              </p>
              <p className="text-sm text-red-700 italic">
                "{registration.rejectReason}"
              </p>
            </div>
          )}

          {/* Step 1: Camper Selection */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              1. Chọn trại viên
            </h3>
            
            <Form.Item
              name="camperIds"
              label={<span className="font-semibold text-gray-900">Trại viên tham gia</span>}
              rules={[
                { required: true, message: "Vui lòng chọn ít nhất một trại viên" },
              ]}
            >
              <Select
                mode="multiple"
                placeholder="Chọn trại viên"
                size="large"
                onChange={handleCamperIdsChange}
                optionLabelProp="label"
              >
                {myCampers.map((camper) => (
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
            </Form.Item>

            {/* Display selected campers info */}
            {selectedCamperIds.length > 0 && (
              <div className="space-y-3 mt-4">
                {selectedCamperIds.map((camperId, index) => {
                  const camper = getCamperById(camperId);
                  if (!camper) return null;

                  return (
                    <div
                      key={camperId}
                      className="border-l-4 border-[#FF8F50] pl-4 pr-4 py-3 bg-white rounded"
                    >
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">
                        Trại viên {index + 1}: {camper.camperName}
                      </h4>
                      
                      <div className="flex gap-4 mb-3">
                        {camper.avatar ? (
                          <img
                            src={camper.avatar}
                            alt={camper.camperName}
                            className="w-20 h-24 rounded-lg object-cover border border-gray-300"
                          />
                        ) : (
                          <div className="w-20 h-24 rounded-lg border-2 border-dashed border-gray-300 bg-gray-100 flex flex-col items-center justify-center">
                            <div className="text-2xl mb-1">📷</div>
                            <p className="text-xs text-gray-500 text-center px-2">No photo</p>
                          </div>
                        )}
                        <div className="flex-1 grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-xs text-gray-600">Giới tính</p>
                            <p className="font-semibold text-gray-900">{camper.gender}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Ngày sinh</p>
                            <p className="font-semibold text-gray-900">{camper.dob}</p>
                          </div>
                        </div>
                      </div>

                      {/* Guardians Section */}
                      <div className="border-t border-gray-200 pt-3">
                        <p className="text-xs font-semibold text-gray-600 mb-2">
                          Người giám hộ
                        </p>
                        {guardianLoadingByIndex[index] ? (
                          <div className="flex justify-center py-4">
                            <Spin size="small" />
                          </div>
                        ) : guardiansByIndex[index]?.length > 0 ? (
                          <div className="space-y-2">
                            {guardiansByIndex[index].map((guardian) => (
                              <div
                                key={guardian.guardianId}
                                className="p-2 bg-gray-50 rounded border border-gray-200"
                              >
                                <div className="grid grid-cols-3 gap-2 text-xs">
                                  <div>
                                    <p className="text-gray-500">Họ tên</p>
                                    <p className="font-semibold text-gray-900">
                                      {guardian.fullName || "N/A"}
                                    </p>
                                  </div>
                                  {guardian.title && (
                                    <div>
                                      <p className="text-gray-500">Mối quan hệ</p>
                                      <p className="font-semibold text-gray-900">
                                        {guardian.title}
                                      </p>
                                    </div>
                                  )}
                                  {guardian.phoneNumber && (
                                    <div>
                                      <p className="text-gray-500">Số điện thoại</p>
                                      <p className="font-semibold text-gray-900">
                                        {guardian.phoneNumber}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-yellow-700 bg-yellow-50 p-2 rounded">
                            Chưa có người giám hộ
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Step 2: Camp Info (Read-only) */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              2. Thông tin trại hè
            </h3>
            <div className="bg-white p-4 rounded border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-2">
                {registration?.camp.name}
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-600">Ngày bắt đầu</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(registration?.camp.startDate || "").toLocaleDateString("vi-VN")}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Ngày kết thúc</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(registration?.camp.endDate || "").toLocaleDateString("vi-VN")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: Promotion & Note */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              3. Khuyến mãi & Ghi chú
            </h3>

            {/* Promotion Selection */}
            <Form.Item
              name="appliedPromotionId"
              label={<span className="font-semibold text-gray-900">Mã khuyến mãi</span>}
            >
              <Select
                placeholder="Chọn mã khuyến mãi (nếu có)"
                size="large"
                allowClear
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                }
                options={[
                  { value: null, label: "Không sử dụng khuyến mãi" },
                  ...promotions.map((promo) => ({
                    value: promo.id,
                    label: `${promo.name} - Giảm ${promo.percent}%`,
                  })),
                ]}
              />
            </Form.Item>

            {/* Note */}
            <Form.Item
              name="note"
              label={<span className="font-semibold text-gray-900">Ghi chú</span>}
            >
              <Input.TextArea
                placeholder="Thêm ghi chú cho đơn đăng ký (tùy chọn)"
                rows={4}
                maxLength={500}
                showCount
              />
            </Form.Item>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong>Lưu ý:</strong> Sau khi cập nhật, đơn đăng ký sẽ được gửi lại để
              chờ duyệt. Vui lòng kiểm tra kỹ thông tin trước khi gửi.
            </p>
          </div>
        </Form>
      )}
    </Modal>
  );
};

export default EditRegistrationModal;
