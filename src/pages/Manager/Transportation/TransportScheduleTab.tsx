import React, { useEffect, useState, useCallback } from 'react';
import { Spin, Modal, Form, Select, DatePicker, TimePicker, Tag } from 'antd';
import { Plus, Calendar, Clock, User, Truck, MapPin, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { useManagerContext } from '../../../hooks/useManagerContext';
import { useNotification } from '../../../contexts/NotificationContext';
import transportScheduleService, {
  type TransportScheduleResponseDto,
  type TransportScheduleRequestDto,
} from '../../../services/transportScheduleService';
import routeService, { type RouteResponseDto } from '../../../services/routeService';
import vehicleService, { type VehicleResponseDto } from '../../../services/vehicleService';
import driverService, { type DriverResponseDto } from '../../../services/driverService';
import campService, { type CampResponseDto } from '../../../services/campService';
import DeletePopover from '../../../components/DeletePopover';

const { Option } = Select;

const TransportScheduleTab: React.FC = () => {
  const { selectedCampId } = useManagerContext();
  const { toastSuccess, toastError } = useNotification();

  const [schedules, setSchedules] = useState<TransportScheduleResponseDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [camp, setCamp] = useState<CampResponseDto | null>(null);

  // Modal states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  // Dropdown data
  const [routes, setRoutes] = useState<RouteResponseDto[]>([]);
  const [vehicles, setVehicles] = useState<VehicleResponseDto[]>([]);
  const [drivers, setDrivers] = useState<DriverResponseDto[]>([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(false);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [loadingDrivers, setLoadingDrivers] = useState(false);
  
  // Track selected transport type for route filtering
  const [selectedTransportType, setSelectedTransportType] = useState<string | undefined>(undefined);

  // Delete popover state
  const [deletePopoverOpen, setDeletePopoverOpen] = useState<number | null>(null);

  // Fetch camp details and schedules
  const fetchCampDetails = useCallback(async () => {
    if (!selectedCampId) return;
    try {
      const campData = await campService.getCampById(selectedCampId);
      setCamp(campData);
    } catch (error) {
      console.error('Failed to load camp details:', error);
    }
  }, [selectedCampId]);

  const fetchSchedules = useCallback(async () => {
    if (!selectedCampId) return;
    try {
      setLoading(true);
      const data = await transportScheduleService.getTransportSchedules({
        campId: selectedCampId ?? undefined,
      });
      setSchedules(data);
    } catch (error) {
      console.error('Failed to load schedules:', error);
      toastError('Error', 'Unable to load transport schedules');
    } finally {
      setLoading(false);
    }
  }, [selectedCampId, toastError]);

  useEffect(() => {
    if (!selectedCampId) {
      setSchedules([]);
      setCamp(null);
      return;
    }

    fetchCampDetails();
    fetchSchedules();
  }, [selectedCampId, fetchCampDetails, fetchSchedules]);

  // Fetch dropdown data when modal opens - only routes
  const fetchDropdownData = async () => {
    try {
      setLoadingDropdowns(true);
      const routesData = await routeService.getAllRoutes();

      // Filter routes by selected camp
      const campRoutes = routesData.filter(r => r.campId === selectedCampId);
      setRoutes(campRoutes);
    } catch (error) {
      console.error('Failed to load dropdown data:', error);
      toastError('Error', 'Failed to load form options');
    } finally {
      setLoadingDropdowns(false);
    }
  };

  const handleAddSchedule = () => {
    form.resetFields();
    setSelectedTransportType(undefined);
    setVehicles([]);
    setDrivers([]);
    setIsModalVisible(true);
    fetchDropdownData();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      const payload: TransportScheduleRequestDto = {
        campId: selectedCampId!,
        routeId: values.routeId,
        driverId: values.driverId,
        vehicleId: values.vehicleId,
        date: values.date.format('YYYY-MM-DD'),
        startTime: values.startTime.format('HH:mm:ss'),
        endTime: values.endTime.format('HH:mm:ss'),
        transportType: values.transportType,
      };

      await transportScheduleService.createTransportSchedule(payload);
      toastSuccess('Success', 'Transport schedule created successfully');
      setIsModalVisible(false);
      form.resetFields();
      fetchSchedules();
    } catch (error: any) {
      console.error('Error creating schedule:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create schedule';
      toastError('Error', errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (scheduleId: number) => {
    try {
      await transportScheduleService.deleteTransportSchedule(scheduleId);
      toastSuccess('Success', 'Schedule deleted successfully');
      fetchSchedules();
      setDeletePopoverOpen(null);
    } catch (error) {
      console.error('Failed to delete schedule:', error);
      toastError('Error', 'Failed to delete schedule');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string }> = {
      NotYet: { color: 'orange' },
      OnGoing: { color: 'blue' },
      Completed: { color: 'green' },
      Canceled: { color: 'red' },
      Rejected: { color: 'red' },
    };

    const config = statusConfig[status] || { color: 'default' };
    return <Tag color={config.color}>{status}</Tag>;
  };

  const formatTime = (time: string) => {
    return time.substring(0, 5); // HH:mm
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-GB');
  };

  // Split schedules by type
  const pickupSchedules = schedules.filter(s => s.transportType === 'PickUp');
  const dropoffSchedules = schedules.filter(s => s.transportType === 'DropOff');

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      {/* Camp Date Info */}
      {camp && (
        <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-indigo-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <Calendar size={24} className="text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-indigo-900">{camp.name}</h3>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-sm text-indigo-700">
                    <strong>Start:</strong> {formatDate(camp.startDate)}
                  </span>
                  <span className="text-sm text-indigo-700">
                    <strong>End:</strong> {formatDate(camp.endDate)}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={handleAddSchedule}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#6366F1] text-white rounded-lg hover:bg-[#4F46E5] transition-all font-medium text-sm"
            >
              <Plus size={16} />
              Add Schedule
            </button>
          </div>
        </div>
      )}

      {/* Schedules Grid - 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pickup Column */}
        <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-[#E5E7EB]">
            <div className="flex items-center gap-2">
              <ArrowUpCircle size={20} className="text-green-600" />
              <h2 className="text-lg font-bold text-[#111827]">
                Pickup Schedules ({pickupSchedules.length})
              </h2>
            </div>
          </div>

          <div className="divide-y divide-[#E5E7EB]">
            {pickupSchedules.length === 0 ? (
              <div className="px-6 py-12 text-center text-[#6B7280]">
                <ArrowUpCircle size={48} className="mx-auto mb-4 text-[#9CA3AF]" />
                <p>No pickup schedules yet</p>
              </div>
            ) : (
              pickupSchedules.map((schedule) => (
                <div
                  key={schedule.transportScheduleId}
                  className="px-6 py-4 hover:bg-[#F9FAFB] transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin size={16} className="text-[#6366F1]" />
                        <span className="font-semibold text-[#111827]">
                          {schedule.routeName.routeName || 'N/A'}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-[#6B7280]">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} />
                          <span>{formatDate(schedule.date)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={14} />
                          <span>{formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User size={14} />
                          <span>{schedule.driverFullName.fullName || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Truck size={14} />
                          <span>{schedule.vehicleName.vehicleName || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(schedule.status)}
                      <DeletePopover
                        onConfirm={() => handleDelete(schedule.transportScheduleId)}
                        title="Delete Schedule"
                        message="Are you sure you want to delete this schedule?"
                        buttonText="Delete"
                        isOpen={deletePopoverOpen === schedule.transportScheduleId}
                        onOpenChange={(open) =>
                          setDeletePopoverOpen(open ? schedule.transportScheduleId : null)
                        }
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Dropoff Column */}
        <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-orange-50 to-amber-50 border-b border-[#E5E7EB]">
            <div className="flex items-center gap-2">
              <ArrowDownCircle size={20} className="text-orange-600" />
              <h2 className="text-lg font-bold text-[#111827]">
                Drop-off Schedules ({dropoffSchedules.length})
              </h2>
            </div>
          </div>

          <div className="divide-y divide-[#E5E7EB]">
            {dropoffSchedules.length === 0 ? (
              <div className="px-6 py-12 text-center text-[#6B7280]">
                <ArrowDownCircle size={48} className="mx-auto mb-4 text-[#9CA3AF]" />
                <p>No drop-off schedules yet</p>
              </div>
            ) : (
              dropoffSchedules.map((schedule) => (
                <div
                  key={schedule.transportScheduleId}
                  className="px-6 py-4 hover:bg-[#F9FAFB] transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin size={16} className="text-[#6366F1]" />
                        <span className="font-semibold text-[#111827]">
                          {schedule.routeName.routeName || 'N/A'}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-[#6B7280]">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} />
                          <span>{formatDate(schedule.date)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={14} />
                          <span>{formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User size={14} />
                          <span>{schedule.driverFullName.fullName || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Truck size={14} />
                          <span>{schedule.vehicleName.vehicleName || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(schedule.status)}
                      <DeletePopover
                        onConfirm={() => handleDelete(schedule.transportScheduleId)}
                        title="Delete Schedule"
                        message="Are you sure you want to delete this schedule?"
                        buttonText="Delete"
                        isOpen={deletePopoverOpen === schedule.transportScheduleId}
                        onOpenChange={(open) =>
                          setDeletePopoverOpen(open ? schedule.transportScheduleId : null)
                        }
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add Schedule Modal */}
      <Modal
        title={
          <div className="text-lg font-bold text-[#111827]">
            Create Transport Schedule
          </div>
        }
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        confirmLoading={submitting}
        width={600}
        okText="Create Schedule"
      >
        <Spin spinning={loadingDropdowns}>
          {/* Camp Info Display */}
          {camp && (
            <div className="mb-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-indigo-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <Calendar size={20} className="text-indigo-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-indigo-900">{camp.name}</h4>
                  <div className="flex items-center gap-4 mt-1 text-xs text-indigo-700">
                    <span>
                      <strong>Start:</strong> {formatDate(camp.startDate)} {new Date(camp.startDate).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span>
                      <strong>End:</strong> {formatDate(camp.endDate)} {new Date(camp.endDate).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <Form form={form} layout="vertical" className="mt-4">
            <Form.Item
              label="Transport Type"
              name="transportType"
              rules={[{ required: true, message: 'Please select transport type!' }]}
            >
              <Select 
                placeholder="Select transport type"
                onChange={(value) => {
                  // Reset route selection when transport type changes
                  form.setFieldsValue({ routeId: undefined });
                  setSelectedTransportType(value);
                }}
              >
                <Option value="PickUp">
                  <div className="flex items-center gap-2">
                    <ArrowUpCircle size={16} className="text-green-600" />
                    Pickup
                  </div>
                </Option>
                <Option value="DropOff">
                  <div className="flex items-center gap-2">
                    <ArrowDownCircle size={16} className="text-orange-600" />
                    Drop-off
                  </div>
                </Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Route"
              name="routeId"
              rules={[{ required: true, message: 'Please select a route!' }]}
            >
              <Select 
                placeholder={!selectedTransportType ? "Select transport type first" : "Select route"} 
                showSearch 
                optionFilterProp="children"
                disabled={!selectedTransportType}
                key={selectedTransportType}
              >
                {routes
                  .filter(route => route.routeType === selectedTransportType)
                  .map((route) => (
                    <Option key={route.routeId} value={route.routeId}>
                      {route.routeName} - {route.routeType}
                    </Option>
                  ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="Date"
              name="date"
              rules={[{ required: true, message: 'Please select date!' }]}
            >
              <DatePicker
                className="w-full"
                format="DD/MM/YYYY"
              />
            </Form.Item>

            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                label="Start Time"
                name="startTime"
                rules={[{ required: true, message: 'Please select start time!' }]}
              >
                <TimePicker className="w-full" format="HH:mm" />
              </Form.Item>

              <Form.Item
                label="End Time"
                name="endTime"
                rules={[{ required: true, message: 'Please select end time!' }]}
              >
                <TimePicker className="w-full" format="HH:mm" />
              </Form.Item>
            </div>

            <Form.Item
              label="Vehicle"
              name="vehicleId"
              rules={[{ required: true, message: 'Please select a vehicle!' }]}
            >
              <Select 
                placeholder="Select vehicle"
                showSearch 
                optionFilterProp="children"
                loading={loadingVehicles}
                notFoundContent={
                  !form.getFieldValue('date') || !form.getFieldValue('startTime') || !form.getFieldValue('endTime')
                    ? "Please fill in date and time first"
                    : loadingVehicles
                    ? null
                    : "No available vehicles"
                }
                onDropdownVisibleChange={async (open) => {
                  if (open) {
                    const date = form.getFieldValue('date');
                    const startTime = form.getFieldValue('startTime');
                    const endTime = form.getFieldValue('endTime');

                    if (!date || !startTime || !endTime) {
                      return;
                    }

                    try {
                      setLoadingVehicles(true);
                      const vehiclesData = await vehicleService.getAvailableVehicles(
                        date.format('YYYY-MM-DD'),
                        startTime.format('HH:mm:ss'),
                        endTime.format('HH:mm:ss')
                      );
                      setVehicles(vehiclesData);
                    } catch (error) {
                      console.error('Failed to load available vehicles:', error);
                      toastError('Error', 'Failed to load available vehicles');
                    } finally {
                      setLoadingVehicles(false);
                    }
                  }
                }}
              >
                {vehicles.map((vehicle) => (
                  <Option key={vehicle.vehicleId} value={vehicle.vehicleId}>
                    {vehicle.vehicleName} - {vehicle.vehicleNumber} (Capacity: {vehicle.capacity})
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="Driver"
              name="driverId"
              rules={[{ required: true, message: 'Please select a driver!' }]}
            >
              <Select 
                placeholder="Select driver"
                showSearch 
                optionFilterProp="children"
                loading={loadingDrivers}
                notFoundContent={
                  !form.getFieldValue('date') || !form.getFieldValue('startTime') || !form.getFieldValue('endTime')
                    ? "Please fill in date and time first"
                    : loadingDrivers
                    ? null
                    : "No available drivers"
                }
                onDropdownVisibleChange={async (open) => {
                  if (open) {
                    const date = form.getFieldValue('date');
                    const startTime = form.getFieldValue('startTime');
                    const endTime = form.getFieldValue('endTime');

                    if (!date || !startTime || !endTime) {
                      return;
                    }

                    try {
                      setLoadingDrivers(true);
                      const driversData = await driverService.getAvailableDrivers(
                        date.format('YYYY-MM-DD'),
                        startTime.format('HH:mm:ss'),
                        endTime.format('HH:mm:ss')
                      );
                      setDrivers(driversData);
                    } catch (error) {
                      console.error('Failed to load available drivers:', error);
                      toastError('Error', 'Failed to load available drivers');
                    } finally {
                      setLoadingDrivers(false);
                    }
                  }
                }}
              >
                {drivers.map((driver) => (
                  <Option key={driver.driverId} value={driver.driverId}>
                    {driver.firstName} {driver.lastName} - {driver.email}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Form>
        </Spin>
      </Modal>
    </div>
  );
};

export default TransportScheduleTab;
