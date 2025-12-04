import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Select, DatePicker, InputNumber, Button, Spin, Checkbox } from "antd";
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
  mode?: "create-core" | "create-optional";
  coreScheduleId?: string;
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
  mode = "create-core",
  coreScheduleId,
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
  const [coreSchedule, setCoreSchedule] = useState<ActivityScheduleResponseDto | null>(null);

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

  // Fetch core schedule when mode is create-optional
  useEffect(() => {
    if (mode === "create-optional" && coreScheduleId) {
      const fetchCoreSchedule = async () => {
        try {
          const schedule = await activityScheduleService.getActivityScheduleById(parseInt(coreScheduleId, 10));
          setCoreSchedule(schedule);
        } catch (error) {
          console.error("Failed to fetch core schedule:", error);
          toastError("Error", "Failed to load core schedule details");
        }
      };
      fetchCoreSchedule();
    }
  }, [mode, coreScheduleId, toastError]);

  // Filter activities based on mode
  useEffect(() => {
    if (mode === "create-core") {
      // Core form: exclude Optional type activities
      const coreActivities = activities.filter(a => a.activityType !== "Optional");
      setFilteredActivities(coreActivities);
    } else if (mode === "create-optional") {
      // Optional form: only Optional type activities
      const optionalActivities = activities.filter(a => a.activityType === "Optional");
      setFilteredActivities(optionalActivities);
    }
  }, [mode, activities]);

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

      if (mode === "create-optional" && coreScheduleId) {
        // Create optional schedule
        const optionalData = {
          activityId,
          staffId: values.staffId ? parseInt(values.staffId, 10) : null,
          maxCapacity: values.maxCapacity ? parseInt(values.maxCapacity, 10) : null,
          locationId: values.locationId ? parseInt(values.locationId, 10) : null,
          isLiveStream: !!values.isLiveStream,
        };

        await activityScheduleService.createOptionalActivitySchedule(parseInt(coreScheduleId, 10), optionalData);
        toastSuccess("Success", "Optional activity schedule created successfully");
        onClose();
      } else {
        // Create core schedule - match API schema exactly
        const scheduleData = {
          activityId,
          staffId: values.staffId ? parseInt(values.staffId, 10) : null,
          locationId: values.locationId ? parseInt(values.locationId, 10) : null,
          startTime: values.startTime.toISOString(),
          endTime: values.endTime.toISOString(),
          isOptional: !!values.isOptional,
          isLiveStream: !!values.isLiveStream,
        };

        onSave(scheduleData);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toastError("Error", "Failed to submit form");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="schedule-form-sidebar">
      <div className="form-header">
        <h2>{mode === "create-optional" ? "Create Optional Activity" : (schedule ? "Edit Schedule" : "Create Schedule")}</h2>
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
              label="Activity"
              name="activityId"
              rules={[{ required: true, message: "Please select or create an activity" }]}
            >
              <Select
                placeholder="Select activity"
                showSearch
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
                      case "CheckIn":
                        return { background: "#dcfce7", color: "#166534", border: "1px solid #10b981" };
                      case "CheckOut":
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
                        Add New Activity
                      </Button>
                    </div>
                  </>
                )}
              />
            </Form.Item>

            {mode === "create-core" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <Form.Item
                    label="Start Time"
                    name="startTime"
                    rules={[{ required: true, message: "Please select start time" }]}
                  >
                    <DatePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: "100%" }} />
                  </Form.Item>

                  <Form.Item
                    label="End Time"
                    name="endTime"
                    rules={[{ required: true, message: "Please select end time" }]}
                  >
                    <DatePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: "100%" }} />
                  </Form.Item>
                </div>

                <Form.Item
                  label="Staff"
                  name="staffId"
                  rules={[{ required: true, message: "Please select staff" }]}
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
                  label="Location"
                  name="locationId"
                  rules={[{ required: true, message: "Please select location" }]}
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

                <Form.Item label="Is Optional" name="isOptional" valuePropName="checked">
                  <Checkbox>This activity has optional slots</Checkbox>
                </Form.Item>

                <Form.Item label="Live Stream" name="isLiveStream" valuePropName="checked">
                  <Checkbox>Enable live streaming for this activity</Checkbox>
                </Form.Item>
              </>
            )}

            {mode === "create-optional" && (
              <>
                <Form.Item
                  label="Staff"
                  name="staffId"
                  rules={[{ required: false, message: "Please select staff" }]}
                >
                  <Select
                    placeholder="Select staff (optional)"
                    showSearch
                    loading={loadingStaffs}
                    notFoundContent={
                      !coreSchedule
                        ? "Please select a core schedule first"
                        : loadingStaffs
                        ? null
                        : "No available staff"
                    }
                    onOpenChange={async (open) => {
                      if (open) {
                        if (!coreSchedule) {
                          return;
                        }

                        try {
                          setLoadingStaffs(true);
                          const startTime = dayjs(coreSchedule.startTime).toISOString();
                          const endTime = dayjs(coreSchedule.endTime).toISOString();
                          const staffs = await staffService.getAvailableStaffInTime(
                            campId,
                            startTime,
                            endTime
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
                    options={availableStaffs.map((staff) => (
                      {
                        label: staff.fullName,
                        value: staff.userId,
                      }
                    ))}
                  />
                </Form.Item>

                <Form.Item
                  label="Location"
                  name="locationId"
                  rules={[{ required: false, message: "Please select location" }]}
                >
                  <Select
                    placeholder="Select location (optional)"
                    showSearch
                    loading={loadingLocations}
                    notFoundContent={
                      !coreSchedule
                        ? "Please select a core schedule first"
                        : loadingLocations
                        ? null
                        : "No available locations"
                    }
                    onOpenChange={async (open) => {
                      if (open) {
                        if (!coreSchedule) {
                          return;
                        }

                        try {
                          setLoadingLocations(true);
                          const startTime = dayjs(coreSchedule.startTime).toISOString();
                          const endTime = dayjs(coreSchedule.endTime).toISOString();
                          const locations = await locationService.getLocationsByCampIdAndTime(
                            campId,
                            startTime,
                            endTime
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
                    options={availableLocations.map((location) => (
                      {
                        label: location.name,
                        value: location.locationId,
                      }
                    ))}
                  />
                </Form.Item>

                <Form.Item
                  label="Max Capacity"
                  name="maxCapacity"
                  rules={[{ required: false, message: "Please enter max capacity" }]}
                >
                  <InputNumber placeholder="Enter max capacity (optional)" min={1} style={{ width: "100%" }} />
                </Form.Item>

                <Form.Item label="Live Stream" name="isLiveStream" valuePropName="checked">
                  <Checkbox>Enable live streaming for this optional activity</Checkbox>
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
          Cancel
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
          {schedule ? "Update Schedule" : "Create Schedule"}
        </Button>
      </div>

      {/* New Activity Modal */}
      <Modal
        title="Create New Activity"
        open={showNewActivityForm}
        onCancel={() => !creatingActivity && setShowNewActivityForm(false)}
        onOk={handleAddNewActivity}
        okButtonProps={{ loading: creatingActivity }}
        cancelButtonProps={{ disabled: creatingActivity }}
        width={400}
      >
        <Form form={newActivityForm} layout="vertical">
          <Form.Item
            label="Activity Name"
            name="activityName"
            rules={[{ required: true, message: "Please enter activity name" }]}
          >
            <Input placeholder="e.g., Team Building" />
          </Form.Item>

          <Form.Item
            label="Activity Type"
            name="activityType"
            rules={[{ required: true, message: "Please select activity type" }]}
          >
            <Select
              placeholder="Select activity type"
              options={[
                { label: "Core", value: "Core" },
                { label: "Optional", value: "Optional" },
                { label: "Resting", value: "Resting" },
                { label: "Check In", value: "CheckIn" },
                { label: "Check Out", value: "CheckOut" },
              ]}
            />
          </Form.Item>

          <Form.Item label="Description" name="description">
            <Input.TextArea placeholder="Enter activity description (optional)" rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ScheduleForm;
