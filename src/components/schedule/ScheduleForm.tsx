import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Select, DatePicker, InputNumber, Button, Spin, Checkbox } from "antd";
import { Plus, X } from "lucide-react";
import dayjs from "dayjs";
import type { ActivityResponseDto } from "../../services/activityService";
import type { ActivityScheduleResponseDto } from "../../services/activityScheduleService";
import { useNotification } from "../../contexts/NotificationContext";
import "./ScheduleForm.css";

interface ScheduleFormProps {
  schedule: ActivityScheduleResponseDto | null;
  activities: ActivityResponseDto[];
  campId: number;
  onClose: () => void;
  onSave: (scheduleData: any, newActivityData?: any) => void;
  initialStartTime?: Date;
  initialEndTime?: Date;
}

const ScheduleForm: React.FC<ScheduleFormProps> = ({
  schedule,
  activities,
  // campId is reserved for future validation use
  onClose,
  onSave,
  initialStartTime,
  initialEndTime,
}) => {
  const { toastError } = useNotification();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [showNewActivityForm, setShowNewActivityForm] = useState(false);
  const [newActivityForm] = Form.useForm();
  const [pendingNewActivity, setPendingNewActivity] = useState<any>(null);

  useEffect(() => {
    if (schedule) {
      // Editing existing schedule
      form.setFieldsValue({
        activityId: activities.find((a) => a.name === schedule.activity?.name)?.activityId,
        staffId: schedule.staffId,
        startTime: dayjs(schedule.startTime),
        endTime: dayjs(schedule.endTime),
        isLivestream: schedule.isLivestream,
        roomId: schedule.roomId,
        maxCapacity: schedule.maxCapacity,
        locationId: schedule.locationId,
      });
    } else if (initialStartTime && initialEndTime) {
      // Creating new schedule from slot selection
      form.setFieldsValue({
        startTime: dayjs(initialStartTime),
        endTime: dayjs(initialEndTime),
      });
    }
  }, [schedule, form, activities, initialStartTime, initialEndTime]);

  const handleAddNewActivity = async () => {
    try {
      const values = await newActivityForm.validateFields();
      const newActivityData = {
        name: values.activityName,
        description: values.description || null,
        activityType: values.activityType || "Core",
      };

      setPendingNewActivity(newActivityData);
      setShowNewActivityForm(false);
      newActivityForm.resetFields();

      form.setFieldsValue({
        activityId: `[NEW] ${newActivityData.name}`,
      });
    } catch (error) {
      console.error("Error validating form:", error);
    }
  };

  const handleFormSubmit = async (values: any) => {
    try {
      setLoading(true);

      const activityId = typeof values.activityId === "number"
        ? values.activityId
        : parseInt(values.activityId, 10);

      const scheduleData = {
        activityId,
        staffId: parseInt(values.staffId, 10),
        startTime: values.startTime.toISOString(),
        endTime: values.endTime.toISOString(),
        isLivestream: !!values.isLivestream,
        roomId: values.roomId ? parseInt(values.roomId, 10) : null,
        maxCapacity: values.maxCapacity ? parseInt(values.maxCapacity, 10) : null,
        locationId: parseInt(values.locationId, 10),
      };

      onSave(scheduleData, pendingNewActivity || undefined);
      setPendingNewActivity(null);
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
        <h2>{schedule ? "Edit Schedule" : "Create Schedule"}</h2>
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
                options={activities.map((a) => ({
                  label: a.name,
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

            <Form.Item
              label="Staff ID"
              name="staffId"
              rules={[{ required: true, message: "Please enter staff ID" }]}
            >
              <InputNumber placeholder="Enter staff ID" min={1} style={{ width: "100%" }} />
            </Form.Item>

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
              label="Location ID"
              name="locationId"
              rules={[{ required: true, message: "Please enter location ID" }]}
            >
              <InputNumber placeholder="Enter location ID" min={1} style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item label="Is Livestream" name="isLivestream" valuePropName="checked">
              <Checkbox>This is a livestream event</Checkbox>
            </Form.Item>

            <Form.Item label="Room ID" name="roomId">
              <InputNumber placeholder="Enter room ID (optional)" style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item label="Max Capacity" name="maxCapacity">
              <InputNumber placeholder="Enter max capacity (optional)" min={1} style={{ width: "100%" }} />
            </Form.Item>
          </Form>
        </Spin>
      </div>

      <div className="schedule-form-footer">
        <Button onClick={onClose}>Cancel</Button>
        <Button
          type="primary"
          loading={loading}
          onClick={() => form.submit()}
        >
          {schedule ? "Update" : "Create"}
        </Button>
      </div>

      {/* New Activity Modal */}
      <Modal
        title="Create New Activity"
        open={showNewActivityForm}
        onCancel={() => setShowNewActivityForm(false)}
        onOk={handleAddNewActivity}
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
