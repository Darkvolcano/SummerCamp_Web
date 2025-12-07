import React, { useEffect, useState } from "react";
import { Modal, Spin, Select } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useNotification } from "../../../contexts/NotificationContext";
import registrationService, {
  type RegistrationResponseDto,
} from "../../../services/registrationService";
import activityScheduleService, {
  type ActivityScheduleResponseDto,
} from "../../../services/activityScheduleService";
import routeService, {
  type RouteResponseDto,
  type RouteStopResponseDto,
} from "../../../services/routeService";
import transportScheduleService, {
  type TransportScheduleResponseDto,
} from "../../../services/transportScheduleService";

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
  [camperId: number]: {
    pickUp?: {
      routeId: number;
      stopPointId: number;
      locationId: number;
      scheduleId: number;
    };
    dropOff?: {
      routeId: number;
      stopPointId: number;
      locationId: number;
      scheduleId: number;
    };
  };
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
  
  // Transport-related states
  const [routes, setRoutes] = useState<RouteResponseDto[]>([]);
  const [routeStops, setRouteStops] = useState<{ [routeId: number]: RouteStopResponseDto[] }>({});
  const [schedules, setSchedules] = useState<{ [routeId: number]: TransportScheduleResponseDto[] }>({});
  const [loadingRoutes, setLoadingRoutes] = useState(false);

  // Fetch optional activities
  useEffect(() => {
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
        initialTransportSelections[camper.camperId] = {};
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

    if (visible && registration) {
      fetchOptionalActivities();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, registration]);

  // Fetch routes when modal opens
  useEffect(() => {
    const fetchRoutes = async () => {
    try {
      setLoadingRoutes(true);
      const allRoutes = await routeService.getRoutesByCampId(registration!.camp.campId);
      setRoutes(allRoutes);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Không thể tải danh sách tuyến đường";
      toastError("Lỗi", errorMessage);
    } finally {
      setLoadingRoutes(false);
    }
  };

    if (visible && registration) {
      fetchRoutes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, registration]);

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

  // Handle route selection
  const handleRouteSelect = async (
    camperId: number,
    type: "pickUp" | "dropOff",
    routeId: number
  ) => {
    try {
      // Fetch route stops for this route
      if (!routeStops[routeId]) {
        const stops = await routeService.getRouteStopsByRouteId(routeId);
        setRouteStops((prev) => ({ ...prev, [routeId]: stops }));
      }

      // Fetch schedules for this route
      if (!schedules[routeId]) {
        const transportSchedules = await transportScheduleService.getTransportSchedules({
          routeId: routeId,
        });
        setSchedules((prev) => ({ ...prev, [routeId]: transportSchedules }));
      }

      // Update transport selection with route
      setTransportSelections((prev) => ({
        ...prev,
        [camperId]: {
          ...prev[camperId],
          [type]: {
            ...prev[camperId]?.[type],
            routeId,
            stopPointId: 0,
            locationId: 0,
            scheduleId: 0,
          },
        },
      }));
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Không thể tải thông tin tuyến đường";
      toastError("Lỗi", errorMessage);
    }
  };

  // Handle stop point selection
  const handleStopPointSelect = (
    camperId: number,
    type: "pickUp" | "dropOff",
    stopPointId: number,
    locationId: number
  ) => {
    setTransportSelections((prev) => {
      const currentTransport = prev[camperId]?.[type];
      if (!currentTransport) return prev;
      
      return {
        ...prev,
        [camperId]: {
          ...prev[camperId],
          [type]: {
            ...currentTransport,
            stopPointId,
            locationId,
          },
        },
      };
    });
  };

  // Handle schedule selection
  const handleScheduleSelect = (
    camperId: number,
    type: "pickUp" | "dropOff",
    scheduleId: number
  ) => {
    setTransportSelections((prev) => {
      const currentTransport = prev[camperId]?.[type];
      if (!currentTransport) return prev;
      
      return {
        ...prev,
        [camperId]: {
          ...prev[camperId],
          [type]: {
            ...currentTransport,
            scheduleId,
          },
        },
      };
    });
  };

  // Toggle transport selection (enable/disable)
  const toggleTransportType = (camperId: number, type: "pickUp" | "dropOff") => {
    setTransportSelections((prev) => {
      const current = prev[camperId] || {};
      const newSelection = { ...current };
      
      if (newSelection[type]) {
        delete newSelection[type];
      } else {
        newSelection[type] = {
          routeId: 0,
          stopPointId: 0,
          locationId: 0,
          scheduleId: 0,
        };
      }

      return {
        ...prev,
        [camperId]: newSelection,
      };
    });
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

      // Build transport choices - combine pickUp and dropOff
      const transportChoices = Object.entries(transportSelections)
        .flatMap(([camperId, selection]) => {
          const choices = [];
          
          // Add pickUp if selected
          if (selection.pickUp && selection.pickUp.scheduleId) {
            choices.push({
              camperId: parseInt(camperId),
              transportScheduleId: selection.pickUp.scheduleId,
              locationId: selection.pickUp.locationId,
            });
          }
          
          // Add dropOff if selected
          if (selection.dropOff && selection.dropOff.scheduleId) {
            choices.push({
              camperId: parseInt(camperId),
              transportScheduleId: selection.dropOff.scheduleId,
              locationId: selection.dropOff.locationId,
            });
          }
          
          return choices;
        });

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
              <div className="mt-6 pt-4 border-t border-gray-300 space-y-4">
                <p className="text-sm font-semibold text-gray-800">
                  Đăng ký dịch vụ đưa đón
                </p>

                {/* PickUp Section */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!transportSelections[camper.camperId]?.pickUp}
                      onChange={() => toggleTransportType(camper.camperId, "pickUp")}
                      className="w-4 h-4 rounded border-2 border-gray-300 text-[#FF8F50] focus:ring-[#FF8F50] cursor-pointer"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Đưa đến trại (Pick Up)
                    </span>
                  </label>

                  {transportSelections[camper.camperId]?.pickUp && (
                    <div className="ml-6 space-y-2">
                      {/* Route Select */}
                      <Select
                        placeholder="Chọn tuyến đường"
                        className="w-full"
                        value={
                          transportSelections[camper.camperId]?.pickUp?.routeId || undefined
                        }
                        onChange={(value) =>
                          handleRouteSelect(camper.camperId, "pickUp", value)
                        }
                        loading={loadingRoutes}
                      >
                        {routes
                          .filter((route) => route.routeType === "PickUp")
                          .map((route) => (
                            <Select.Option
                              key={route.routeId}
                              value={route.routeId}
                            >
                              {route.routeName}
                            </Select.Option>
                          ))}
                      </Select>

                      {/* Stop Point Select */}
                      {(transportSelections[camper.camperId]?.pickUp?.routeId ?? 0) > 0 && (
                        <Select
                          placeholder="Chọn điểm dừng"
                          className="w-full"
                          value={
                            transportSelections[camper.camperId]?.pickUp
                              ?.stopPointId || undefined
                          }
                          onChange={(value) => {
                            const routeId = transportSelections[camper.camperId]?.pickUp?.routeId;
                            if (!routeId) return;
                            
                            const stop = routeStops[routeId]?.find((s) => s.routeStopId === value);
                            if (stop) {
                              handleStopPointSelect(
                                camper.camperId,
                                "pickUp",
                                value,
                                stop.location.id
                              );
                            }
                          }}
                        >
                          {transportSelections[camper.camperId]?.pickUp?.routeId &&
                            routeStops[
                              transportSelections[camper.camperId].pickUp!.routeId
                            ]?.map((stop) => (
                            <Select.Option
                              key={stop.routeStopId}
                              value={stop.routeStopId}
                            >
                              {stop.location.name} - {stop.location.address}
                            </Select.Option>
                          ))}
                        </Select>
                      )}

                      {/* Schedule Select */}
                      {(transportSelections[camper.camperId]?.pickUp?.stopPointId ?? 0) > 0 && (
                        <Select
                          placeholder="Chọn lịch trình"
                          className="w-full"
                          value={
                            transportSelections[camper.camperId]?.pickUp
                              ?.scheduleId || undefined
                          }
                          onChange={(value) =>
                            handleScheduleSelect(camper.camperId, "pickUp", value)
                          }
                        >
                          {transportSelections[camper.camperId]?.pickUp?.routeId &&
                            schedules[
                              transportSelections[camper.camperId].pickUp!.routeId
                            ]
                              ?.filter((s) => s.transportType === "PickUp")
                              .map((schedule) => (
                              <Select.Option
                                key={schedule.transportScheduleId}
                                value={schedule.transportScheduleId}
                              >
                                {dayjs(schedule.date).format("DD/MM/YYYY")} -{" "}
                                {schedule.startTime} - {schedule.endTime}
                              </Select.Option>
                            ))}
                        </Select>
                      )}
                    </div>
                  )}
                </div>

                {/* DropOff Section */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!transportSelections[camper.camperId]?.dropOff}
                      onChange={() => toggleTransportType(camper.camperId, "dropOff")}
                      className="w-4 h-4 rounded border-2 border-gray-300 text-[#FF8F50] focus:ring-[#FF8F50] cursor-pointer"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Đón về (Drop Off)
                    </span>
                  </label>

                  {transportSelections[camper.camperId]?.dropOff && (
                    <div className="ml-6 space-y-2">
                      {/* Route Select */}
                      <Select
                        placeholder="Chọn tuyến đường"
                        className="w-full"
                        value={
                          transportSelections[camper.camperId]?.dropOff?.routeId || undefined
                        }
                        onChange={(value) =>
                          handleRouteSelect(camper.camperId, "dropOff", value)
                        }
                        loading={loadingRoutes}
                      >
                        {routes
                          .filter((route) => route.routeType === "DropOff")
                          .map((route) => (
                            <Select.Option
                              key={route.routeId}
                              value={route.routeId}
                            >
                              {route.routeName}
                            </Select.Option>
                          ))}
                      </Select>

                      {/* Stop Point Select */}
                      {(transportSelections[camper.camperId]?.dropOff?.routeId ?? 0) > 0 && (
                        <Select
                          placeholder="Chọn điểm dừng"
                          className="w-full"
                          value={
                            transportSelections[camper.camperId]?.dropOff
                              ?.stopPointId || undefined
                          }
                          onChange={(value) => {
                            const routeId = transportSelections[camper.camperId]?.dropOff?.routeId;
                            if (!routeId) return;
                            
                            const stop = routeStops[routeId]?.find((s) => s.routeStopId === value);
                            if (stop) {
                              handleStopPointSelect(
                                camper.camperId,
                                "dropOff",
                                value,
                                stop.location.id
                              );
                            }
                          }}
                        >
                          {transportSelections[camper.camperId]?.dropOff?.routeId &&
                            routeStops[
                              transportSelections[camper.camperId].dropOff!.routeId
                            ]?.map((stop) => (
                            <Select.Option
                              key={stop.routeStopId}
                              value={stop.routeStopId}
                            >
                              {stop.location.name} - {stop.location.address}
                            </Select.Option>
                          ))}
                        </Select>
                      )}

                      {/* Schedule Select */}
                      {(transportSelections[camper.camperId]?.dropOff?.stopPointId ?? 0) > 0 && (
                        <Select
                          placeholder="Chọn lịch trình"
                          className="w-full"
                          value={
                            transportSelections[camper.camperId]?.dropOff
                              ?.scheduleId || undefined
                          }
                          onChange={(value) =>
                            handleScheduleSelect(camper.camperId, "dropOff", value)
                          }
                        >
                          {transportSelections[camper.camperId]?.dropOff?.routeId &&
                            schedules[
                              transportSelections[camper.camperId].dropOff!.routeId
                            ]
                              ?.filter((s) => s.transportType === "DropOff")
                              .map((schedule) => (
                              <Select.Option
                                key={schedule.transportScheduleId}
                                value={schedule.transportScheduleId}
                              >
                                {dayjs(schedule.date).format("DD/MM/YYYY")} -{" "}
                                {schedule.startTime} - {schedule.endTime}
                              </Select.Option>
                            ))}
                        </Select>
                      )}
                    </div>
                  )}
                </div>
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
