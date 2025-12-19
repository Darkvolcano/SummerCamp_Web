import React, { useEffect, useState, useCallback } from 'react';
import { Spin, Modal, Form, Select, DatePicker, TimePicker, Tag, Switch } from 'antd';
import { Plus, Calendar, Clock, User, Truck, MapPin, ArrowUpCircle, ArrowDownCircle, Repeat } from 'lucide-react';
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
  const [isRoundTrip, setIsRoundTrip] = useState(false);

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
      toastError('Lỗi', 'Không thể tải lịch trình đưa đón');
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
      toastError('Lỗi', 'Không thể tải tùy chọn form');
    } finally {
      setLoadingDropdowns(false);
    }
  };

  const handleAddSchedule = () => {
    form.resetFields();
    setSelectedTransportType(undefined);
    setVehicles([]);
    setDrivers([]);
    setIsRoundTrip(false);
    setIsModalVisible(true);
    fetchDropdownData();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      if (isRoundTrip) {
        // Create both pickup and dropoff schedules
        const pickupPayload: TransportScheduleRequestDto = {
          campId: selectedCampId!,
          routeId: values.pickupRouteId,
          driverId: values.driverId,
          vehicleId: values.vehicleId,
          date: values.pickupDate.format('YYYY-MM-DD'),
          startTime: values.pickupStartTime.format('HH:mm:ss'),
          endTime: values.pickupEndTime.format('HH:mm:ss'),
          transportType: 'PickUp',
        };

        const dropoffPayload: TransportScheduleRequestDto = {
          campId: selectedCampId!,
          routeId: values.dropoffRouteId,
          driverId: values.driverId,
          vehicleId: values.vehicleId,
          date: values.dropoffDate.format('YYYY-MM-DD'),
          startTime: values.dropoffStartTime.format('HH:mm:ss'),
          endTime: values.dropoffEndTime.format('HH:mm:ss'),
          transportType: 'DropOff',
        };

        await transportScheduleService.bulkCreateTransportSchedules({
          schedules: [pickupPayload, dropoffPayload],
        });
        toastSuccess('Thành công', 'Tạo lịch trình khứ hồi thành công');
      } else {
        // Create single schedule
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
        toastSuccess('Thành công', 'Tạo lịch trình đưa đón thành công');
      }

      setIsModalVisible(false);
      form.resetFields();
      setIsRoundTrip(false);
      fetchSchedules();
    } catch (error: any) {
      console.error('Error creating schedule:', error);
      const errorMessage = error.response?.data?.message || 'Không thể tạo lịch trình';
      toastError('Lỗi', errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (scheduleId: number) => {
    try {
      await transportScheduleService.deleteTransportSchedule(scheduleId);
      toastSuccess('Thành công', 'Xóa lịch trình thành công');
      fetchSchedules();
      setDeletePopoverOpen(null);
    } catch (error) {
      console.error('Failed to delete schedule:', error);
      toastError('Lỗi', 'Không thể xóa lịch trình');
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
                    <strong>Bắt đầu:</strong> {formatDate(camp.startDate)}
                  </span>
                  <span className="text-sm text-indigo-700">
                    <strong>Kết thúc:</strong> {formatDate(camp.endDate)}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={handleAddSchedule}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#6366F1] text-white rounded-lg hover:bg-[#4F46E5] transition-all font-medium text-sm"
            >
              <Plus size={16} />
              Thêm Lịch Trình
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
                Lịch Trình Đón ({pickupSchedules.length})
              </h2>
            </div>
          </div>

          <div className="divide-y divide-[#E5E7EB]">
            {pickupSchedules.length === 0 ? (
              <div className="px-6 py-12 text-center text-[#6B7280]">
                <ArrowUpCircle size={48} className="mx-auto mb-4 text-[#9CA3AF]" />
                <p>Chưa có lịch trình đón nào</p>
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
                        title="Xóa Lịch Trình"
                        message="Bạn có chắc muốn xóa lịch trình này?"
                        buttonText="Xóa"
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
                Lịch Trình Trả ({dropoffSchedules.length})
              </h2>
            </div>
          </div>

          <div className="divide-y divide-[#E5E7EB]">
            {dropoffSchedules.length === 0 ? (
              <div className="px-6 py-12 text-center text-[#6B7280]">
                <ArrowDownCircle size={48} className="mx-auto mb-4 text-[#9CA3AF]" />
                <p>Chưa có lịch trình trả nào</p>
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
                        title="Xóa Lịch Trình"
                        message="Bạn có chắc muốn xóa lịch trình này?"
                        buttonText="Xóa"
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
            Tạo Lịch Trình Đưa Đón
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
        okText="Tạo Lịch Trình"
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
                      <strong>Bắt đầu:</strong> {formatDate(camp.startDate)} {new Date(camp.startDate).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span>
                      <strong>Kết thúc:</strong> {formatDate(camp.endDate)} {new Date(camp.endDate).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <Form form={form} layout="vertical" className="mt-4">
            {/* Round Trip Switch */}
            <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Repeat size={20} className="text-purple-600" />
                  <div>
                    <h4 className="text-sm font-bold text-purple-900">Khứ Hồi</h4>
                    <p className="text-xs text-purple-700">Tạo cả lịch trình đón và trả</p>
                  </div>
                </div>
                <Switch
                  checked={isRoundTrip}
                  onChange={(checked) => {
                    setIsRoundTrip(checked);
                    form.resetFields();
                    setVehicles([]);
                    setDrivers([]);
                  }}
                />
              </div>
            </div>

            {!isRoundTrip ? (
              // Single Schedule Form
              <>
                <Form.Item
                  label="Loại Đưa Đón"
                  name="transportType"
                  rules={[{ required: true, message: 'Vui lòng chọn loại đưa đón!' }]}
                >
                  <Select
                    placeholder="Chọn loại đưa đón"
                    onChange={(value) => {
                      // Reset route selection when transport type changes
                      form.setFieldsValue({ routeId: undefined });
                      setSelectedTransportType(value);
                    }}
                  >
                    <Option value="PickUp">
                      <div className="flex items-center gap-2">
                        <ArrowUpCircle size={16} className="text-green-600" />
                        Đón
                      </div>
                    </Option>
                    <Option value="DropOff">
                      <div className="flex items-center gap-2">
                        <ArrowDownCircle size={16} className="text-orange-600" />
                        Trả
                      </div>
                    </Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  label="Tuyến Đường"
                  name="routeId"
                  rules={[{ required: true, message: 'Vui lòng chọn tuyến đường!' }]}
                >
                  <Select
                    placeholder={!selectedTransportType ? "Vui lòng chọn loại đưa đón trước" : "Chọn tuyến đường"}
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
                  label="Ngày"
                  name="date"
                  rules={[{ required: true, message: 'Vui lòng chọn ngày!' }]}
                >
                  <DatePicker
                    className="w-full"
                    format="DD/MM/YYYY"
                  />
                </Form.Item>

                <div className="grid grid-cols-2 gap-4">
                  <Form.Item
                    label="Giờ Bắt Đầu"
                    name="startTime"
                    rules={[{ required: true, message: 'Vui lòng chọn giờ bắt đầu!' }]}
                  >
                    <TimePicker className="w-full" format="HH:mm" />
                  </Form.Item>

                  <Form.Item
                    label="Giờ Kết Thúc"
                    name="endTime"
                    rules={[{ required: true, message: 'Vui lòng chọn giờ kết thúc!' }]}
                  >
                    <TimePicker className="w-full" format="HH:mm" />
                  </Form.Item>
                </div>

                <Form.Item
                  label="Phương Tiện"
                  name="vehicleId"
                  rules={[{ required: true, message: 'Vui lòng chọn phương tiện!' }]}
                >
                  <Select
                    placeholder="Chọn phương tiện"
                    showSearch
                    optionFilterProp="children"
                    loading={loadingVehicles}
                    notFoundContent={
                      !form.getFieldValue('date') || !form.getFieldValue('startTime') || !form.getFieldValue('endTime')
                        ? "Vui lòng điền ngày và giờ trước"
                        : loadingVehicles
                          ? null
                          : "Không có xe khả dụng"
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
                          toastError('Lỗi', 'Không thể tải xe khả dụng');
                        } finally {
                          setLoadingVehicles(false);
                        }
                      }
                    }}
                  >
                    {vehicles.map((vehicle) => (
                      <Option key={vehicle.vehicleId} value={vehicle.vehicleId}>
                        {vehicle.vehicleName} - {vehicle.vehicleNumber} (Sức chứa: {vehicle.capacity})
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  label="Tài Xế"
                  name="driverId"
                  rules={[{ required: true, message: 'Vui lòng chọn tài xế!' }]}
                >
                  <Select
                    placeholder="Chọn tài xế"
                    showSearch
                    optionFilterProp="children"
                    loading={loadingDrivers}
                    notFoundContent={
                      !form.getFieldValue('date') || !form.getFieldValue('startTime') || !form.getFieldValue('endTime')
                        ? "Vui lòng điền ngày và giờ trước"
                        : loadingDrivers
                          ? null
                          : "Không có tài xế khả dụng"
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
                          toastError('Lỗi', 'Không thể tải tài xế khả dụng');
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
              </>
            ) : (
              // Round Trip Form - Two Sections
              <>
                {/* Pickup Section */}
                <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-4">
                    <ArrowUpCircle size={20} className="text-green-600" />
                    <h3 className="text-base font-bold text-green-900">Lịch Trình Đón</h3>
                  </div>

                  <Form.Item
                    label="Tuyến Đón"
                    name="pickupRouteId"
                    rules={[{ required: true, message: 'Vui lòng chọn tuyến đón!' }]}
                  >
                    <Select
                      placeholder="Chọn tuyến đón"
                      showSearch
                      optionFilterProp="children"
                    >
                      {routes
                        .filter(route => route.routeType === 'PickUp')
                        .map((route) => (
                          <Option key={route.routeId} value={route.routeId}>
                            {route.routeName}
                          </Option>
                        ))}
                    </Select>
                  </Form.Item>

                  <Form.Item
                    label="Ngày Đón"
                    name="pickupDate"
                    rules={[{ required: true, message: 'Vui lòng chọn ngày đón!' }]}
                  >
                    <DatePicker
                      className="w-full"
                      format="DD/MM/YYYY"
                    />
                  </Form.Item>

                  <div className="grid grid-cols-2 gap-4">
                    <Form.Item
                      label="Giờ Bắt Đầu"
                      name="pickupStartTime"
                      rules={[{ required: true, message: 'Vui lòng chọn giờ bắt đầu!' }]}
                    >
                      <TimePicker className="w-full" format="HH:mm" />
                    </Form.Item>

                    <Form.Item
                      label="Giờ Kết Thúc"
                      name="pickupEndTime"
                      rules={[{ required: true, message: 'Vui lòng chọn giờ kết thúc!' }]}
                    >
                      <TimePicker className="w-full" format="HH:mm" />
                    </Form.Item>
                  </div>
                </div>

                {/* Drop-off Section */}
                <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-4">
                    <ArrowDownCircle size={20} className="text-orange-600" />
                    <h3 className="text-base font-bold text-orange-900">Lịch Trình Trả</h3>
                  </div>

                  <Form.Item
                    label="Tuyến Trả"
                    name="dropoffRouteId"
                    rules={[{ required: true, message: 'Vui lòng chọn tuyến trả!' }]}
                  >
                    <Select
                      placeholder="Chọn tuyến trả"
                      showSearch
                      optionFilterProp="children"
                    >
                      {routes
                        .filter(route => route.routeType === 'DropOff')
                        .map((route) => (
                          <Option key={route.routeId} value={route.routeId}>
                            {route.routeName}
                          </Option>
                        ))}
                    </Select>
                  </Form.Item>

                  <Form.Item
                    label="Ngày Trả"
                    name="dropoffDate"
                    rules={[{ required: true, message: 'Vui lòng chọn ngày trả!' }]}
                  >
                    <DatePicker
                      className="w-full"
                      format="DD/MM/YYYY"
                    />
                  </Form.Item>

                  <div className="grid grid-cols-2 gap-4">
                    <Form.Item
                      label="Giờ Bắt Đầu"
                      name="dropoffStartTime"
                      rules={[{ required: true, message: 'Vui lòng chọn giờ bắt đầu!' }]}
                    >
                      <TimePicker className="w-full" format="HH:mm" />
                    </Form.Item>

                    <Form.Item
                      label="Giờ Kết Thúc"
                      name="dropoffEndTime"
                      rules={[{ required: true, message: 'Vui lòng chọn giờ kết thúc!' }]}
                    >
                      <TimePicker className="w-full" format="HH:mm" />
                    </Form.Item>
                  </div>
                </div>

                {/* Shared Vehicle & Driver Section */}
                <div className="mb-4 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-4">
                    <Truck size={20} className="text-indigo-600" />
                    <h3 className="text-base font-bold text-indigo-900">Tài Nguyên Chia Sẻ</h3>
                  </div>

                  <Form.Item
                    label="Phương Tiện"
                    name="vehicleId"
                    rules={[{ required: true, message: 'Vui lòng chọn phương tiện!' }]}
                  >
                    <Select
                      placeholder="Chọn phương tiện"
                      showSearch
                      optionFilterProp="children"
                      loading={loadingVehicles}
                      notFoundContent={
                        !form.getFieldValue('pickupDate') || !form.getFieldValue('pickupStartTime') || !form.getFieldValue('pickupEndTime')
                          ? "Vui lòng điền ngày và giờ đón trước"
                          : loadingVehicles
                            ? null
                            : "Không có xe khả dụng"
                      }
                      onDropdownVisibleChange={async (open) => {
                        if (open) {
                          const date = form.getFieldValue('pickupDate');
                          const startTime = form.getFieldValue('pickupStartTime');
                          const endTime = form.getFieldValue('pickupEndTime');

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
                            toastError('Lỗi', 'Không thể tải xe khả dụng');
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
                    label="Tài Xế"
                    name="driverId"
                    rules={[{ required: true, message: 'Vui lòng chọn tài xế!' }]}
                  >
                    <Select
                      placeholder="Chọn tài xế"
                      showSearch
                      optionFilterProp="children"
                      loading={loadingDrivers}
                      notFoundContent={
                        !form.getFieldValue('pickupDate') || !form.getFieldValue('pickupStartTime') || !form.getFieldValue('pickupEndTime')
                          ? "Vui lòng điền ngày và giờ đón trước"
                          : loadingDrivers
                            ? null
                            : "Không có tài xế khả dụng"
                      }
                      onDropdownVisibleChange={async (open) => {
                        if (open) {
                          const date = form.getFieldValue('pickupDate');
                          const startTime = form.getFieldValue('pickupStartTime');
                          const endTime = form.getFieldValue('pickupEndTime');

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
                            toastError('Lỗi', 'Không thể tải tài xế khả dụng');
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
                </div>
              </>
            )}
          </Form>
        </Spin>
      </Modal>
    </div>
  );
};

export default TransportScheduleTab;
