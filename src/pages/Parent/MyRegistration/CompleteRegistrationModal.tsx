import React, { useEffect, useState } from "react";
import { Modal, Spin } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useNotification } from "../../../contexts/NotificationContext";
import registrationService, {
  type RegistrationResponseDto,
} from "../../../services/registrationService";
import activityScheduleService, {
  type ActivityScheduleResponseDto,
} from "../../../services/activityScheduleService";

interface CompleteRegistrationModalProps {
  visible: boolean;
  registration: RegistrationResponseDto | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface CamperSelection {
  [camperId: number]: number[]; // camperId -> array of selected activityScheduleIds
}

interface TransportSelection {
  [camperId: number]: boolean; // camperId -> requestTransport
}

interface TimeSlot {
  start: string;
  end: string;
}

const CompleteRegistrationModal: React.FC<CompleteRegistrationModalProps> = ({
  visible,
  registration,
  onClose,
  onSuccess,
}) => {
  const { toastError, toastSuccess } = useNotification();
  const [optionalActivities, setOptionalActivities] = useState<
    ActivityScheduleResponseDto[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [camperSelections, setCamperSelections] = useState<CamperSelection>({});
  const [transportSelections, setTransportSelections] = useState<TransportSelection>({});

  // Fetch optional activities
  useEffect(() => {
    if (visible && registration) {
      fetchOptionalActivities();
    }
  }, [visible, registration]);

  const fetchOptionalActivities = async () => {
    try {
      setLoading(true);
      const activities = await activityScheduleService.getOptionalSchedulesByCamp(
        registration!.camp.campId
      );
      setOptionalActivities(activities);

      // Initialize selections
      const initialSelections: CamperSelection = {};
      const initialTransportSelections: TransportSelection = {};
      registration!.campers?.forEach((camper) => {
        initialSelections[camper.camperId] = [];
        initialTransportSelections[camper.camperId] = camper.requestTransport || false;
      });
      setCamperSelections(initialSelections);
      setTransportSelections(initialTransportSelections);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Không thể tải danh sách hoạt động";
      toastError("Lỗi", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Check if two time slots overlap
  const isTimeOverlap = (slot1: TimeSlot, slot2: TimeSlot): boolean => {
    const start1 = dayjs(slot1.start);
    const end1 = dayjs(slot1.end);
    const start2 = dayjs(slot2.start);
    const end2 = dayjs(slot2.end);

    return start1.isBefore(end2) && start2.isBefore(end1);
  };

  // Check if an activity can be selected (no time overlap with selected activities)
  const canSelectActivity = (
    camperId: number,
    activityToCheck: ActivityScheduleResponseDto
  ): boolean => {
    const selectedIds = camperSelections[camperId] || [];
    const selectedActivities = optionalActivities.filter((a) =>
      selectedIds.includes(a.activityScheduleId)
    );

    const activityTimeSlot: TimeSlot = {
      start: activityToCheck.startTime,
      end: activityToCheck.endTime,
    };

    return !selectedActivities.some((selected) => {
      const selectedTimeSlot: TimeSlot = {
        start: selected.startTime,
        end: selected.endTime,
      };
      return isTimeOverlap(activityTimeSlot, selectedTimeSlot);
    });
  };

  // Toggle activity selection
  const toggleActivitySelection = (camperId: number, activityId: number) => {
    setCamperSelections((prev) => {
      const current = prev[camperId] || [];
      const isSelected = current.includes(activityId);

      if (isSelected) {
        return {
          ...prev,
          [camperId]: current.filter((id) => id !== activityId),
        };
      } else {
        return {
          ...prev,
          [camperId]: [...current, activityId],
        };
      }
    });
  };

  // Toggle transport selection
  const toggleTransportSelection = (camperId: number) => {
    setTransportSelections((prev) => ({
      ...prev,
      [camperId]: !prev[camperId],
    }));
  };

  // Handle submit
  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      // Build optional choices
      const optionalChoices = Object.entries(camperSelections)
        .flatMap(([camperId, activityIds]: [string, number[]]) =>
          activityIds.map((activityId: number) => ({
            camperId: parseInt(camperId),
            activityScheduleId: activityId,
          }))
        );

      // Build transport choices
      const transportChoices = registration!.campers?.map((camper) => ({
        camperId: camper.camperId,
        requestTransport: transportSelections[camper.camperId] || false,
      })) || [];

      // Call API to generate payment link with optional choices and transport choices
      const paymentData = await registrationService.generatePaymentLink(
        registration!.registrationId,
        {
          optionalChoices: optionalChoices.length > 0 ? optionalChoices : null,
          transportChoices: transportChoices.length > 0 ? transportChoices : null,
        }
      );

      if (paymentData.paymentUrl) {
        window.location.href = paymentData.paymentUrl;
      } else {
        toastSuccess("Thành công", "Hoàn tất đăng ký thành công");
        onSuccess();
        onClose();
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Không thể hoàn tất đăng ký";
      toastError("Lỗi", errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={
        <div className="text-lg font-bold text-gray-900">
          Hoàn tất đăng ký - {registration?.camp?.name}
        </div>
      }
      open={visible}
      onCancel={onClose}
      width={900}
      footer={null}
      className="complete-registration-modal"
    >
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Spin size="large" />
        </div>
      ) : (
        <div className="space-y-6 max-h-[600px] overflow-y-auto">
          {registration?.campers?.map((camper) => (
            <div
              key={camper.camperId}
              className="bg-gray-50 rounded-lg p-6 border border-gray-200"
            >
              <div className="flex items-center gap-3 mb-4">
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
                <h3 className="text-base font-bold text-gray-900">
                  {camper.camperName}
                </h3>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                Chọn các hoạt động tùy chọn:
              </p>

              <div className="flex flex-wrap gap-2">
                {optionalActivities.map((activity) => {
                  const isSelected =
                    (camperSelections[camper.camperId] || []).includes(
                      activity.activityScheduleId
                    );
                  const canSelect = canSelectActivity(
                    camper.camperId,
                    activity
                  );
                  const isDisabled = !canSelect && !isSelected;

                  return (
                    <button
                      key={activity.activityScheduleId}
                      onClick={() => {
                        if (!isDisabled) {
                          toggleActivitySelection(
                            camper.camperId,
                            activity.activityScheduleId
                          );
                        }
                      }}
                      disabled={isDisabled}
                      className={`px-4 py-2 rounded-full font-medium transition-all text-sm flex items-center gap-2 focus:outline-none ${
                        isSelected
                          ? "bg-[#FF8F50] text-white"
                          : isDisabled
                          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                          : "bg-orange-50 text-gray-700 border-2 border-dashed border-[#FF8F50] hover:bg-orange-100"
                      }`}
                      title={
                        isDisabled
                          ? "Hoạt động này trùng thời gian với hoạt động đã chọn"
                          : undefined
                      }
                    >
                      <span className="text-xs">
                        {activity.activity?.name || "Hoạt động"}
                      </span>
                      <span className="text-xs font-bold">
                        {isSelected ? (
                          <CloseOutlined className="text-sm" />
                        ) : (
                          "+"
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>

              {optionalActivities.length === 0 && (
                <p className="text-sm text-gray-500 italic">
                  Không có hoạt động tùy chọn nào
                </p>
              )}

              {/* Transport Selection */}
              <div className="mt-6 pt-4 border-t border-gray-300">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={transportSelections[camper.camperId] || false}
                    onChange={() => toggleTransportSelection(camper.camperId)}
                    className="w-5 h-5 rounded border-2 border-gray-300 text-[#FF8F50] focus:ring-[#FF8F50] focus:ring-offset-0 cursor-pointer"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800 group-hover:text-[#FF8F50] transition-colors">
                      Đăng ký dịch vụ đưa đón
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Dịch vụ xe đưa đón an toàn từ điểm tập trung đến trại hè
                    </p>
                  </div>
                </label>
              </div>
            </div>
          ))}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 px-4 py-3 bg-[#FF8F50] text-white font-medium rounded-lg hover:bg-[#ff7e3d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Đang xử lý..." : "Hoàn tất & Thanh toán"}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default CompleteRegistrationModal;
