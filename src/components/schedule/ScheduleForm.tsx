import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Select, DatePicker, Button, Spin, Checkbox } from "antd";
import { Plus, X } from "lucide-react";
import dayjs from "dayjs";
import activityService, { type ActivityResponseDto } from "../../services/activityService";
import type { ActivityScheduleResponseDto } from "../../services/activityScheduleService";
import activityScheduleService from "../../services/activityScheduleService";
import staffService, { type StaffInfo } from "../../services/staffService";
import locationService, { type LocationResponseDto } from "../../services/LocationService";
import { useNotification } from "../../contexts/NotificationContext";
import "./ScheduleForm.css";

interface ScheduleFormProps {
  schedule: ActivityScheduleResponseDto | null;
  activities: ActivityResponseDto[];
  campId: number;
  onClose: () => void;
  onSave: (scheduleData: any) => void;
  onActivityCreated?: (activity: ActivityResponseDto) => void;
  initialStartTime?: Date;
  initialEndTime?: Date;
}


const ScheduleForm: React.FC<ScheduleFormProps> = ({
  schedule,
  activities,
  campId,
  onClose,
  onSave,
  onActivityCreated,
  initialStartTime,
  initialEndTime,
}) => {
  const { toastError, toastSuccess } = useNotification();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [showNewActivityForm, setShowNewActivityForm] = useState(false);
  const [newActivityForm] = Form.useForm();
  const [creatingActivity, setCreatingActivity] = useState(false);
  const [filteredActivities, setFilteredActivities] = useState<ActivityResponseDto[]>([]);
  const [availableStaffs, setAvailableStaffs] = useState<StaffInfo[]>([]);
  const [loadingStaffs, setLoadingStaffs] = useState(false);
  const [availableLocations, setAvailableLocations] = useState<LocationResponseDto[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [availableGroups, setAvailableGroups] = useState<any[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [selectedActivityType, setSelectedActivityType] = useState<"Core" | "Optional" | "Resting" | "Checkin" | "Checkout" | null>(null);

  useEffect(() => {
    if (schedule) {
      // Editing
      form.setFieldsValue({
        activityId: activities.find((a) => a.name === schedule.activity?.name)?.activityId,
        staffId: schedule.staff?.userId,
        startTime: dayjs(schedule.startTime),
        endTime: dayjs(schedule.endTime),
        isOptional: schedule.isOptional,
        isLiveStream: schedule.isLivestream, // API returns isLivestream (lowercase s), form uses isLiveStream (uppercase S)
        maxCapacity: schedule.maxCapacity,
        locationId: schedule.location?.id,
      });
    } else if (initialStartTime && initialEndTime) {
      // Creating
      form.setFieldsValue({
        startTime: dayjs(initialStartTime),
        endTime: dayjs(initialEndTime),
      });
    }
  }, [schedule, form, activities, initialStartTime, initialEndTime]);

  useEffect(() => {
    setFilteredActivities(activities);
  }, [activities]);

  // Groups will be fetched dynamically when dropdown opens (similar to staff and locations)

  const handleAddNewActivity = async () => {
    try {
      setCreatingActivity(true);
      const values = await newActivityForm.validateFields();

      const newActivity = await activityService.createActivity({
        name: values.activityName,
        description: values.description || null,
        activityType: values.activityType || "Core",
        campId: campId,
      });

      setShowNewActivityForm(false);
      newActivityForm.resetFields();

      form.setFieldsValue({
        activityId: newActivity.activityId,
      });

      // Set selectedActivityType to show corresponding form fields
      setSelectedActivityType(newActivity.activityType as "Core" | "Optional" | "Resting" | "Checkin" | "Checkout");

      onActivityCreated?.(newActivity);

      toastSuccess("Success", `Activity "${newActivity.name}" created successfully`);
    } catch (error) {
      console.error("Error creating activity:", error);
      toastError("Error", "Failed to create activity");
    } finally {
      setCreatingActivity(false);
    }
  };

  const handleFormSubmit = async (values: any) => {
    try {
      setLoading(true);

      const activityId = typeof values.activityId === "number"
        ? values.activityId
        : parseInt(values.activityId, 10);

      const selectedActivity = activities.find(a => a.activityId === activityId);
      if (!selectedActivity) {
        toastError("Error", "Selected activity not found");
        return;
      }

      const activityType = selectedActivity.activityType;

      if (activityType === "Core") {
        const coreData = {
          activityId,
          staffId: values.staffId ? parseInt(values.staffId, 10) : null,
          locationId: values.locationId ? parseInt(values.locationId, 10) : null,
          startTime: values.startTime.toISOString(),
          endTime: values.endTime.toISOString(),
          isLiveStream: !!values.isLiveStream,
          isRepeat: !!values.isRepeat,
          groupIds: values.groupIds && values.groupIds.length > 0 
            ? values.groupIds.map((id: any) => parseInt(id, 10))
            : null,
        };

        const response = await activityScheduleService.createCoreActivitySchedule(coreData);
        
        if (response.successes && response.successes.length > 0) {
          toastSuccess("Success", `Created ${response.successes.length} schedule(s) successfully`);
          response.successes.forEach((schedule: any) => onSave(schedule));
        }
        
        if (response.errors && response.errors.length > 0) {
          response.errors.forEach((error: any) => {
            const errorMessage = typeof error === 'string' ? error : (error.message || 'Unknown error');
            toastError("Warning", errorMessage);
          });
        }
        
        if (response.successes && response.successes.length > 0) {
          onClose();
        }
      } else if (activityType === "Optional") {
        const optionalData = {
          activityId,
          staffId: values.staffId ? parseInt(values.staffId, 10) : null,
          locationId: values.locationId ? parseInt(values.locationId, 10) : null,
          startTime: values.startTime.toISOString(),
          endTime: values.endTime.toISOString(),
          isLiveStream: !!values.isLiveStream,
          isRepeat: !!values.isRepeat,
        };

        const response = await activityScheduleService.createOptionalActivitySchedule(optionalData);
        
        if (response.successes && response.successes.length > 0) {
          toastSuccess("Success", `Created ${response.successes.length} schedule(s) successfully`);
          response.successes.forEach((schedule: any) => onSave(schedule));
        }
        
        if (response.errors && response.errors.length > 0) {
          response.errors.forEach((error: any) => {
            const errorMessage = typeof error === 'string' ? error : (error.message || 'Unknown error');
            toastError("Warning", errorMessage);
          });
        }
        
        if (response.successes && response.successes.length > 0) {
          onClose();
        }
      } else if (activityType === "Resting") {
        const restingData = {
          activityId,
          startTime: values.startTime.toISOString(),
          endTime: values.endTime.toISOString(),
          isRepeat: !!values.isRepeat,
        };

        const response = await activityScheduleService.createRestingActivitySchedule(restingData);
        
        if (response.successes && response.successes.length > 0) {
          toastSuccess("Success", `Created ${response.successes.length} schedule(s) successfully`);
          response.successes.forEach((schedule: any) => onSave(schedule));
        }
        
        if (response.errors && response.errors.length > 0) {
          response.errors.forEach((error: any) => {
            const errorMessage = typeof error === 'string' ? error : (error.message || 'Unknown error');
            toastError("Warning", errorMessage);
          });
        }
        
        if (response.successes && response.successes.length > 0) {
          onClose();
        }
      } else if (activityType === "Checkin" || activityType === "Checkout") {
        const startTime = values.startTime as dayjs.Dayjs;
        const endTime = values.endTime as dayjs.Dayjs;
        
        const checkInOutData = {
          activityId,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          locationId: values.locationId ? parseInt(values.locationId, 10) : 0,
        };

        const response = await activityScheduleService.createCheckInCheckOutSchedule(checkInOutData);
        toastSuccess("Thành công", `Tạo lịch trình ${activityType} thành công`);
        onSave(response);
        onClose();
      } else {
        toastError("Error", `Activity type "${activityType}" is not supported for schedule creation`);
      }
    } catch (error: any) {
      console.error("Error submitting form:", error);
      
      // Extract error message from API response
      let errorMessage = "Failed to create schedule";
      
      if (error.response?.data) {
        const errorData = error.response.data;
        
        // Handle different error formats
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.title) {
          errorMessage = errorData.title;
        } else if (errorData.errors) {
          // Validation errors
          const errors = Object.entries(errorData.errors)
            .map(([field, messages]) => `${field}: ${(messages as string[]).join(', ')}`)
            .join('\n');
          errorMessage = errors;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toastError("Lỗi", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="schedule-form-sidebar">
      <div className="form-header">
        <h2>{schedule ? "Sửa Lịch Trình" : "Tạo Lịch Trình"}</h2>
        <button className="icon-btn close-btn" onClick={onClose} style={{ width: '36px', height: '36px' }}>
          <X size={20} />
        </button>
      </div>

      <div className="schedule-form">
        <Spin spinning={loading}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleFormSubmit}
          >
            <Form.Item
              label={<span className="text-sm font-semibold text-[#374151]">Hoạt Động</span>}
            name="activityId"
            rules={[{ required: true, message: "Vui lòng chọn hoặc tạo hoạt động" }]}
            >
              <Select
                placeholder="Select activity"
                showSearch
                onChange={(value) => {
                  const selected = activities.find(a => a.activityId === value);
                  if (selected) {
                    setSelectedActivityType(selected.activityType as "Core" | "Optional" | "Resting" | "Checkin" | "Checkout");
                  }
                }}
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toString()
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                optionRender={(option: any) => {
                  const activity = filteredActivities.find(a => a.activityId === option.data.value);
                  if (!activity) return option.label;

                  const getTypeBadgeStyle = (type: string) => {
                    switch (type) {
                      case "Core":
                        return { background: "#dbeafe", color: "#1e40af", border: "1px solid #3b82f6" };
                      case "Optional":
                        return { background: "#fef3c7", color: "#b45309", border: "1px solid #f59e0b" };
                      case "Resting":
                        return { background: "#e0e7ff", color: "#3730a3", border: "1px solid #6366f1" };
                      case "Checkin":
                        return { background: "#dcfce7", color: "#166534", border: "1px solid #10b981" };
                      case "Checkout":
                        return { background: "#fecaca", color: "#991b1b", border: "1px solid #ef4444" };
                      default:
                        return { background: "#f3f4f6", color: "#374151", border: "1px solid #d1d5db" };
                    }
                  };

                  const badgeStyle = getTypeBadgeStyle(activity.activityType);

                  return (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                      <span>{activity.name}</span>
                      <span style={{
                        ...badgeStyle,
                        padding: "2px 8px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        fontWeight: "600",
                        whiteSpace: "nowrap"
                      }}>
                        {activity.activityType}
                      </span>
                    </div>
                  );
                }}
                options={filteredActivities.map((a) => ({
                  label: `${a.name} (${a.activityType})`,
                  value: a.activityId,
                }))}
                dropdownRender={(menu) => (
                  <>
                    {menu}
                    <div className="border-t border-gray-200 p-2">
                      <Button
                        type="dashed"
                        block
                        icon={<Plus size={14} />}
                        onClick={() => setShowNewActivityForm(true)}
                        className="text-blue-600"
                      >
                        Thêm Hoạt Động Mới
                      </Button>
                    </div>
                  </>
                )}
              />
            </Form.Item>

            {/* Common fields: Start Time and End Time (always shown) */}
            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                label={<span className="text-sm font-semibold text-[#374151]">Thời Gian Bắt Đầu</span>}
                name="startTime"
                rules={[{ required: true, message: "Vui lòng chọn thời gian bắt đầu" }]}
              >
                <DatePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item
                label={<span className="text-sm font-semibold text-[#374151]">Thời Gian Kết Thúc</span>}
                name="endTime"
                rules={[{ required: true, message: "Vui lòng chọn thời gian kết thúc" }]}
              >
                <DatePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: "100%" }} />
              </Form.Item>
            </div>

            {/* Core Activity Fields */}
            {selectedActivityType === "Core" && (
              <>
                <Form.Item
                  label={<span className="text-sm font-semibold text-[#374151]">Nhân Viên</span>}
                  name="staffId"
                  rules={[{ required: true, message: "Vui lòng chọn nhân viên" }]}
                >
                  <Select
                    placeholder="Select staff"
                    showSearch
                    loading={loadingStaffs}
                    notFoundContent={
                      !form.getFieldValue("startTime") || !form.getFieldValue("endTime")
                        ? "Please fill in start time and end time first"
                        : loadingStaffs
                        ? null
                        : "No available staff"
                    }
                    onOpenChange={async (open) => {
                      if (open) {
                        const startTime = form.getFieldValue("startTime");
                        const endTime = form.getFieldValue("endTime");

                        if (!startTime || !endTime) {
                          return;
                        }

                        try {
                          setLoadingStaffs(true);
                          const staffs = await staffService.getAvailableStaffInTime(
                            campId,
                            startTime.toISOString(),
                            endTime.toISOString()
                          );
                          setAvailableStaffs(staffs);
                        } catch (error) {
                          console.error("Failed to fetch available staffs:", error);
                          toastError("Error", "Failed to load available staff");
                        } finally {
                          setLoadingStaffs(false);
                        }
                      }
                    }}
                    filterOption={(input, option) =>
                      (option?.label ?? "")
                        .toString()
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    options={availableStaffs.map((staff) => ({
                      label: staff.fullName,
                      value: staff.userId,
                    }))}
                  />
                </Form.Item>

                <Form.Item
                  label={<span className="text-sm font-semibold text-[#374151]">Địa Điểm</span>}
                  name="locationId"
                  rules={[{ required: true, message: "Vui lòng chọn địa điểm" }]}
                >
                  <Select
                    placeholder="Select location"
                    showSearch
                    loading={loadingLocations}
                    notFoundContent={
                      !form.getFieldValue("startTime") || !form.getFieldValue("endTime")
                        ? "Please fill in start time and end time first"
                        : loadingLocations
                        ? null
                        : "No available locations"
                    }
                    onOpenChange={async (open) => {
                      if (open) {
                        const startTime = form.getFieldValue("startTime");
                        const endTime = form.getFieldValue("endTime");

                        if (!startTime || !endTime) {
                          return;
                        }

                        try {
                          setLoadingLocations(true);
                          const locations = await locationService.getLocationsByCampIdAndTime(
                            campId,
                            startTime.toISOString(),
                            endTime.toISOString()
                          );
                          setAvailableLocations(locations);
                        } catch (error) {
                          console.error("Failed to fetch available locations:", error);
                          toastError("Error", "Failed to load available locations");
                        } finally {
                          setLoadingLocations(false);
                        }
                      }
                    }}
                    filterOption={(input, option) =>
                      (option?.label ?? "")
                        .toString()
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    options={availableLocations.map((location) => ({
                      label: location.name,
                      value: location.locationId,
                    }))}
                  />
                </Form.Item>

                <Form.Item
                  label={<span className="text-sm font-semibold text-[#374151]">Nhóm</span>}
                  name="groupIds"
                  rules={[{ required: true, message: "Vui lòng chọn ít nhất một nhóm" }]}
                >
                  <Select
                    mode="multiple"
                    placeholder="Select groups"
                    showSearch
                    loading={loadingGroups}
                    notFoundContent={
                      !form.getFieldValue("startTime") || !form.getFieldValue("endTime")
                        ? "Please fill in start time and end time first"
                        : loadingGroups
                        ? null
                        : "No available groups"
                    }
                    onOpenChange={async (open) => {
                      if (open) {
                        const startTime = form.getFieldValue("startTime");
                        const endTime = form.getFieldValue("endTime");

                        if (!startTime || !endTime) {
                          return;
                        }

                        try {
                          setLoadingGroups(true);
                          const groups = await activityScheduleService.getAvailableGroups(
                            campId,
                            startTime.toISOString(),
                            endTime.toISOString()
                          );
                          setAvailableGroups(groups);
                        } catch (error) {
                          console.error("Failed to fetch available groups:", error);
                          toastError("Error", "Failed to load available groups");
                        } finally {
                          setLoadingGroups(false);
                        }
                      }
                    }}
                    filterOption={(input, option) =>
                      (option?.label ?? "")
                        .toString()
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    options={availableGroups.map((group) => ({
                      label: group.groupName,
                      value: group.groupId,
                    }))}
                  />
                </Form.Item>

                <Form.Item label={<span className="text-sm font-semibold text-[#374151]">Live Stream</span>} name="isLiveStream" valuePropName="checked">
                  <Checkbox>Bật live streaming cho hoạt động này</Checkbox>
                </Form.Item>

                <Form.Item label={<span className="text-sm font-semibold text-[#374151]">Lặp Lại</span>} name="isRepeat" valuePropName="checked">
                  <Checkbox>Lặp lại lịch trình này</Checkbox>
                </Form.Item>
              </>
            )}

            {/* Optional Activity Fields */}
            {selectedActivityType === "Optional" && (
              <>
                <Form.Item
                  label={<span className="text-sm font-semibold text-[#374151]">Nhân Viên</span>}
                  name="staffId"
                  rules={[{ required: false, message: "Vui lòng chọn nhân viên" }]}
                >
                  <Select
                    placeholder="Select staff (optional)"
                    showSearch
                    loading={loadingStaffs}
                    notFoundContent={
                      !form.getFieldValue("startTime") || !form.getFieldValue("endTime")
                        ? "Please fill in start time and end time first"
                        : loadingStaffs
                        ? null
                        : "No available staff"
                    }
                    onOpenChange={async (open) => {
                      if (open) {
                        const startTime = form.getFieldValue("startTime");
                        const endTime = form.getFieldValue("endTime");

                        if (!startTime || !endTime) {
                          return;
                        }

                        try {
                          setLoadingStaffs(true);
                          const staffs = await staffService.getAvailableStaffInTime(
                            campId,
                            startTime.toISOString(),
                            endTime.toISOString()
                          );
                          setAvailableStaffs(staffs);
                        } catch (error) {
                          console.error("Failed to fetch available staffs:", error);
                          toastError("Error", "Failed to load available staff");
                        } finally {
                          setLoadingStaffs(false);
                        }
                      }
                    }}
                    filterOption={(input, option) =>
                      (option?.label ?? "")
                        .toString()
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    options={availableStaffs.map((staff) => ({
                      label: staff.fullName,
                      value: staff.userId,
                    }))}
                  />
                </Form.Item>

                <Form.Item
                  label={<span className="text-sm font-semibold text-[#374151]">Địa Điểm</span>}
                  name="locationId"
                  rules={[{ required: false, message: "Vui lòng chọn địa điểm" }]}
                >
                  <Select
                    placeholder="Select location (optional)"
                    showSearch
                    loading={loadingLocations}
                    notFoundContent={
                      !form.getFieldValue("startTime") || !form.getFieldValue("endTime")
                        ? "Please fill in start time and end time first"
                        : loadingLocations
                        ? null
                        : "No available locations"
                    }
                    onOpenChange={async (open) => {
                      if (open) {
                        const startTime = form.getFieldValue("startTime");
                        const endTime = form.getFieldValue("endTime");

                        if (!startTime || !endTime) {
                          return;
                        }

                        try {
                          setLoadingLocations(true);
                          const locations = await locationService.getLocationsByCampIdAndTime(
                            campId,
                            startTime.toISOString(),
                            endTime.toISOString()
                          );
                          setAvailableLocations(locations);
                        } catch (error) {
                          console.error("Failed to fetch available locations:", error);
                          toastError("Error", "Failed to load available locations");
                        } finally {
                          setLoadingLocations(false);
                        }
                      }
                    }}
                    filterOption={(input, option) =>
                      (option?.label ?? "")
                        .toString()
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    options={availableLocations.map((location) => ({
                      label: location.name,
                      value: location.locationId,
                    }))}
                  />
                </Form.Item>

                <Form.Item label={<span className="text-sm font-semibold text-[#374151]">Live Stream</span>} name="isLiveStream" valuePropName="checked">
                  <Checkbox>Bật live streaming cho hoạt động tùy chọn này</Checkbox>
                </Form.Item>

                <Form.Item label={<span className="text-sm font-semibold text-[#374151]">Lặp Lại</span>} name="isRepeat" valuePropName="checked">
                  <Checkbox>Lặp lại lịch trình này</Checkbox>
                </Form.Item>
              </>
            )}

            {/* Resting Activity Fields */}
            {selectedActivityType === "Resting" && (
              <Form.Item label={<span className="text-sm font-semibold text-[#374151]">Lặp Lại</span>} name="isRepeat" valuePropName="checked">
                <Checkbox>Lặp lại lịch trình này</Checkbox>
              </Form.Item>
            )}

            {/* CheckIn/CheckOut Activity Fields */}
            {(selectedActivityType === "Checkin" || selectedActivityType === "Checkout") && (
              <>
                <Form.Item
                  label={<span className="text-sm font-semibold text-[#374151]">Địa Điểm</span>}
                  name="locationId"
                  rules={[{ required: true, message: "Vui lòng chọn địa điểm" }]}
                >
                  <Select
                    placeholder="Chọn địa điểm"
                    showSearch
                    loading={loadingLocations}
                    notFoundContent={
                      loadingLocations
                        ? null
                        : !form.getFieldValue("startTime") || !form.getFieldValue("endTime")
                        ? "Vui lòng điền Thời Gian Bắt Đầu và Kết Thúc trước"
                        : "Không có địa điểm"
                    }
                    onOpenChange={async (open) => {
                      if (open) {
                        const startTime = form.getFieldValue("startTime") as dayjs.Dayjs;
                        const endTime = form.getFieldValue("endTime") as dayjs.Dayjs;

                        if (!startTime || !endTime) {
                          return;
                        }

                        try {
                          setLoadingLocations(true);
                          const locations = await locationService.getLocationsByCampIdAndTime(
                            campId,
                            startTime.toISOString(),
                            endTime.toISOString()
                          );
                          setAvailableLocations(locations);
                        } catch (error) {
                          console.error("Failed to fetch locations:", error);
                          toastError("Lỗi", "Không thể tải danh sách địa điểm");
                        } finally {
                          setLoadingLocations(false);
                        }
                      }
                    }}
                    filterOption={(input, option) =>
                      (option?.label ?? "")
                        .toString()
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    options={availableLocations.map((location) => ({
                      label: location.name,
                      value: location.locationId,
                    }))}
                  />
                </Form.Item>
              </>
            )}
          </Form>
        </Spin>
      </div>

      <div className="schedule-form-footer" style={{ 
        display: 'flex', 
        gap: '12px', 
        justifyContent: 'flex-end',
        padding: '16px 24px',
        borderTop: '1px solid #E5E7EB',
        backgroundColor: '#F9FAFB'
      }}>
        <Button 
          onClick={onClose}
          size="large"
          style={{
            borderRadius: '8px',
            fontWeight: 500,
            height: '40px',
            paddingLeft: '20px',
            paddingRight: '20px'
          }}
        >
          Hủy
        </Button>
        <Button
          type="primary"
          loading={loading}
          onClick={() => form.submit()}
          size="large"
          style={{
            borderRadius: '8px',
            fontWeight: 500,
            height: '40px',
            paddingLeft: '24px',
            paddingRight: '24px',
            backgroundColor: '#6366F1',
            borderColor: '#6366F1'
          }}
        >
          {schedule ? "Cập Nhật Lịch Trình" : "Tạo Lịch Trình"}
        </Button>
      </div>

      {/* New Activity Modal */}
      <Modal
        title="Tạo Hoạt Động Mới"
        open={showNewActivityForm}
        onCancel={() => !creatingActivity && setShowNewActivityForm(false)}
        onOk={handleAddNewActivity}
        okButtonProps={{ loading: creatingActivity }}
        cancelButtonProps={{ disabled: creatingActivity }}
        width={400}
      >
        <Form form={newActivityForm} layout="vertical">
          <Form.Item
            label={<span className="text-sm font-semibold text-[#374151]">Tên Hoạt Động</span>}
            name="activityName"
            rules={[{ required: true, message: "Vui lòng nhập tên hoạt động" }]}
          >
            <Input placeholder="e.g., Team Building" />
          </Form.Item>

          <Form.Item
            label={<span className="text-sm font-semibold text-[#374151]">Loại Hoạt Động</span>}
            name="activityType"
            rules={[{ required: true, message: "Vui lòng chọn loại hoạt động" }]}
          >
            <Select
              placeholder="Select activity type"
              options={[
                { label: "Core", value: "Core" },
                { label: "Optional", value: "Optional" },
                { label: "Resting", value: "Resting" },
                { label: "Check In", value: "Checkin" },
                { label: "Check Out", value: "Checkout" },
              ]}
            />
          </Form.Item>

          <Form.Item label={<span className="text-sm font-semibold text-[#374151]">Mô Tả</span>} name="description">
            <Input.TextArea placeholder="Nhập mô tả hoạt động (tùy chọn)" rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ScheduleForm;
