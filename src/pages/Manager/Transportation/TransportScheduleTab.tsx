import React, { useEffect, useState, useCallback } from 'react';
import { Spin, Modal, Form, Select, DatePicker, TimePicker, Tag, Switch } from 'antd';
import { Plus, Calendar, Clock, User, Users, Truck, MapPin, ArrowUpCircle, ArrowDownCircle, Repeat, Eye } from 'lucide-react';
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
import transportStaffAssignmentService from '../../../services/transportStaffAssignmentService';
import dayjs from 'dayjs';

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

  // Detail modal state
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [scheduleDetail, setScheduleDetail] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Staff assignments state
  const [staffAssignments, setStaffAssignments] = useState<any[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  
  // Available staff state
  const [availableStaff, setAvailableStaff] = useState<any[]>([]);
  const [loadingAvailableStaff, setLoadingAvailableStaff] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState<number | undefined>(undefined);
  const [addingStaff, setAddingStaff] = useState(false);

  // Campers state
  const [scheduleCampers, setScheduleCampers] = useState<any[]>([]);
  const [loadingCampers, setLoadingCampers] = useState(false);

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
      toastError('Cảnh báo', 'Không thể tải lịch trình đưa đón');
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
      toastError('Cảnh báo', 'Không thể tải tùy chọn form');
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
      toastError('Cảnh báo', errorMessage);
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
      toastError('Cảnh báo', 'Không thể xóa lịch trình');
    }
  };

  const handleViewDetails = async (scheduleId: number) => {
    try {
      setLoadingDetail(true);
      setIsDetailModalVisible(true);
      setSelectedStaffId(undefined); // Reset selection
      const detail = await transportScheduleService.getScheduleByIdWithStaff(scheduleId);
      setScheduleDetail(detail);
      
      // Load staff assignments, available staff, and campers
      console.log('Loading staff and campers for schedule:', scheduleId);
      loadStaffAssignments(scheduleId);
      loadAvailableStaff(scheduleId);
      loadScheduleCampers(scheduleId);
    } catch (error) {
      console.error('Failed to load schedule details:', error);
      toastError('Cảnh báo', 'Không thể tải chi tiết lịch trình');
      setIsDetailModalVisible(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  const loadStaffAssignments = async (scheduleId: number) => {
    try {
      setLoadingStaff(true);
      const assignments = await transportStaffAssignmentService.getTransportStaffAssignments({
        transportScheduleId: scheduleId,
        status: 'Active',
      });
      setStaffAssignments(assignments);
    } catch (error) {
      console.error('Failed to load staff assignments:', error);
      setStaffAssignments([]);
    } finally {
      setLoadingStaff(false);
    }
  };

  const loadAvailableStaff = async (scheduleId: number) => {
    try {
      setLoadingAvailableStaff(true);
      const staff = await transportStaffAssignmentService.getAvailableStaff(scheduleId);
      console.log('Available staff response:', staff);
      
      // Debug: Check for null userId
      const nullStaff = staff.filter((s: any) => s.userId == null);
      if (nullStaff.length > 0) {
        console.warn('Found staff with null userId:', nullStaff);
      }
      
      setAvailableStaff(staff);
    } catch (error) {
      console.error('Failed to load available staff:', error);
      setAvailableStaff([]);
    } finally {
      setLoadingAvailableStaff(false);
    }
  };

  const loadScheduleCampers = async (scheduleId: number) => {
    try {
      setLoadingCampers(true);
      const campers = await transportScheduleService.getCampersByScheduleId(scheduleId);
      setScheduleCampers(campers);
    } catch (error) {
      console.error('Failed to load schedule campers:', error);
      setScheduleCampers([]);
    } finally {
      setLoadingCampers(false);
    }
  };

  const handleAddStaff = async () => {
    if (selectedStaffId === undefined || !scheduleDetail?.transportScheduleId) {
      toastError('Cảnh báo', 'Vui lòng chọn nhân viên');
      return;
    }

    try {
      setAddingStaff(true);
      // Note: API expects staffId, but we're passing userId from available staff
      await transportStaffAssignmentService.createTransportStaffAssignment({
        transportScheduleId: scheduleDetail.transportScheduleId,
        staffId: selectedStaffId, // This is actually userId from AvailableStaffDto
      });
      toastSuccess('Thành công', 'Đã thêm nhân viên vào chuyến xe');
      
      // Refresh both lists
      await Promise.all([
        loadStaffAssignments(scheduleDetail.transportScheduleId),
        loadAvailableStaff(scheduleDetail.transportScheduleId),
      ]);
      
      // Reset selection
      setSelectedStaffId(undefined);
    } catch (error: any) {
      console.error('Failed to add staff:', error);
      const errorMsg = error.response?.data?.message || 'Không thể thêm nhân viên';
      toastError('Cảnh báo', errorMsg);
    } finally {
      setAddingStaff(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string }> = {
      NotYet: { color: 'orange' },
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
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewDetails(schedule.transportScheduleId)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all font-medium text-sm"
                        >
                          <Eye size={16} />
                          Chi tiết
                        </button>
                        {!['Canceled', 'InProgress', 'Completed'].includes(schedule.status) && (
                          <DeletePopover
                            onConfirm={() => handleDelete(schedule.transportScheduleId)}
                            title="Hủy Lịch Trình"
                            message="Bạn có chắc muốn hủy lịch trình này?"
                            buttonText="Hủy"
                            isOpen={deletePopoverOpen === schedule.transportScheduleId}
                            onOpenChange={(open) =>
                              setDeletePopoverOpen(open ? schedule.transportScheduleId : null)
                            }
                          />
                        )}
                      </div>
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
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewDetails(schedule.transportScheduleId)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all font-medium text-sm"
                        >
                          <Eye size={16} />
                          Chi tiết
                        </button>
                        {!['Canceled', 'InProgress', 'Completed'].includes(schedule.status) && (
                          <DeletePopover
                            onConfirm={() => handleDelete(schedule.transportScheduleId)}
                            title="Hủy Lịch Trình"
                            message="Bạn có chắc muốn hủy lịch trình này?"
                            buttonText="Hủy"
                            isOpen={deletePopoverOpen === schedule.transportScheduleId}
                            onOpenChange={(open) =>
                              setDeletePopoverOpen(open ? schedule.transportScheduleId : null)
                            }
                          />
                        )}
                      </div>
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
                          toastError('Cảnh báo', 'Không thể tải xe khả dụng');
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
                          toastError('Cảnh báo', 'Không thể tải tài xế khả dụng');
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
                    <h3 className="text-base font-bold text-indigo-900">Tài Xế và Phương Tiện</h3>
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
                            toastError('Cảnh báo', 'Không thể tải xe khả dụng');
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
                            toastError('Cảnh báo', 'Không thể tải tài xế khả dụng');
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

      {/* Detail Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <Truck size={20} className="text-[#6366F1]" />
            <span className="text-lg font-bold text-[#111827]">Chi Tiết Lịch Trình Đưa Đón</span>
          </div>
        }
        open={isDetailModalVisible}
        onCancel={() => {
          setIsDetailModalVisible(false);
          setScheduleDetail(null);
          setSelectedStaffId(undefined);
        }}
        footer={null}
        width={700}
        centered
      >
        {loadingDetail ? (
          <div className="flex justify-center items-center py-12">
            <Spin size="large" tip="Đang tải chi tiết..." />
          </div>
        ) : scheduleDetail ? (
          <div className="space-y-6">
            {/* Basic Info - Single Card with 2 Columns */}
            <div className="bg-[#F9FAFB] rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-[#6366F1] mt-0.5" />
                  <div className="flex-1">
                    <span className="text-xs font-semibold text-[#6B7280] uppercase block mb-1">Tuyến Đường</span>
                    <p className="text-sm font-bold text-[#111827]">
                      {scheduleDetail.routeName?.routeName || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <ArrowUpCircle size={18} className={scheduleDetail.transportType === 'PickUp' ? 'text-green-600' : 'text-orange-600'} />
                  <div className="flex-1">
                    <span className="text-xs font-semibold text-[#6B7280] uppercase block mb-1">Type</span>
                    <p className="text-sm font-bold text-[#111827]">
                      {scheduleDetail.transportType || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Truck size={18} className="text-[#6366F1] mt-0.5" />
                  <div className="flex-1">
                    <span className="text-xs font-semibold text-[#6B7280] uppercase block mb-1">Phương Tiện</span>
                    <p className="text-sm font-bold text-[#111827]">
                      {scheduleDetail.vehicleName?.vehicleName || 'N/A'}
                    </p>
                    {scheduleDetail.vehicleName?.vehicleNumber && (
                      <p className="text-xs text-[#6B7280] mt-0.5">
                        Biển số: {scheduleDetail.vehicleName.vehicleNumber}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <User size={18} className="text-[#6366F1] mt-0.5" />
                  <div className="flex-1">
                    <span className="text-xs font-semibold text-[#6B7280] uppercase block mb-1">Tài Xế</span>
                    <p className="text-sm font-bold text-[#111827]">
                      {scheduleDetail.driverFullName?.fullName || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar size={18} className="text-[#6366F1] mt-0.5" />
                  <div className="flex-1">
                    <span className="text-xs font-semibold text-[#6B7280] uppercase block mb-1">Ngày</span>
                    <p className="text-sm font-bold text-[#111827]">
                      {formatDate(scheduleDetail.date)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 col-span-2">
                  <Clock size={18} className="text-[#6366F1] mt-0.5" />
                  <div className="flex-1">
                    <span className="text-xs font-semibold text-[#6B7280] uppercase block mb-1">Giờ Dự Kiến</span>
                    <p className="text-sm font-bold text-[#111827]">
                      {formatTime(scheduleDetail.startTime)} - {formatTime(scheduleDetail.endTime)}
                    </p>
                  </div>
                </div>

                {(scheduleDetail.actualStartTime || scheduleDetail.actualEndTime) && (
                  <div className="flex items-start gap-3 col-span-2">
                    <Clock size={18} className="text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <span className="text-xs font-semibold text-[#6B7280] uppercase block mb-1">Giờ Thực Tế</span>
                      <p className="text-sm font-bold text-green-700">
                        {scheduleDetail.actualStartTime ? formatTime(scheduleDetail.actualStartTime) : '--:--'} - {scheduleDetail.actualEndTime ? formatTime(scheduleDetail.actualEndTime) : '--:--'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center justify-between p-4 bg-[#F9FAFB] rounded-lg">
              <span className="text-sm font-semibold text-[#6B7280]">Trạng Thái:</span>
              {getStatusBadge(scheduleDetail.status)}
            </div>

            {/* Staff List */}
            <div>
              <h3 className="text-sm font-bold text-[#111827] mb-3 pb-2 border-b-2 border-blue-600 inline-block">
                Nhân Viên Chuyến Xe ({staffAssignments.length})
              </h3>
              
              {/* Add Staff Section */}
              <div className="mt-4 mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs font-semibold text-blue-700 uppercase mb-3">Thêm Nhân Viên Hỗ Trợ</p>
                <div className="flex gap-2">
                  <Select
                    placeholder="Chọn nhân viên"
                    style={{ flex: 1 }}
                    value={selectedStaffId}
                    onChange={(value) => {
                      console.log('Selected value:', value);
                      setSelectedStaffId(value);
                    }}
                    loading={loadingAvailableStaff}
                    disabled={loadingAvailableStaff || addingStaff}
                    showSearch
                    optionFilterProp="children"
                    getPopupContainer={(triggerNode) => triggerNode.parentNode as HTMLElement}
                    dropdownMatchSelectWidth={false}
                    virtual={false}
                  >
                    {(() => {
                      console.log('Rendering options - availableStaff:', availableStaff);
                      const filtered = availableStaff.filter((staff: any) => staff.userId != null);
                      console.log('Filtered staff:', filtered);
                      return filtered.map((staff: any) => (
                        <Option key={staff.userId} value={staff.userId}>
                          {staff.fullName}
                        </Option>
                      ));
                    })()}
                  </Select>
                  <button
                    onClick={handleAddStaff}
                    disabled={selectedStaffId === undefined || addingStaff}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all font-medium text-sm whitespace-nowrap"
                  >
                    {addingStaff ? 'Đang thêm...' : 'Thêm'}
                  </button>
                </div>
                {availableStaff.length === 0 && !loadingAvailableStaff && (
                  <p className="text-xs text-gray-500 mt-2 italic">Không có nhân viên khả dụng</p>
                )}
              </div>
              
              {loadingStaff ? (
                <div className="flex justify-center py-8">
                  <Spin tip="Đang tải nhân viên..." />
                </div>
              ) : staffAssignments.length > 0 ? (
                <div className="space-y-2 mt-4">
                  {staffAssignments.map((assignment: any, index: number) => (
                    <div
                      key={assignment.transportStaffAssignmentId || assignment.id || index}
                      className="flex items-center gap-3 p-3 bg-[#F9FAFB] rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6366F1] to-[#4F46E5] flex items-center justify-center">
                        <User size={20} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-[#111827]">
                          ID: {assignment.staffId}
                        </p>
                        <p className="text-xs text-[#6B7280]">
                          {assignment.staffName || 'N/A'}
                        </p>
                      </div>
                      <DeletePopover
                        onConfirm={async () => {
                          try {
                            await transportStaffAssignmentService.deleteTransportStaffAssignment(
                              assignment.id || assignment.transportStaffAssignmentId
                            );
                            toastSuccess('Thành công', 'Đã xóa nhân viên khỏi chuyến xe');
                            // Refresh both lists
                            if (scheduleDetail?.transportScheduleId) {
                              await Promise.all([
                                loadStaffAssignments(scheduleDetail.transportScheduleId),
                                loadAvailableStaff(scheduleDetail.transportScheduleId),
                              ]);
                            }
                          } catch (error: any) {
                            console.error('Failed to delete staff assignment:', error);
                            const errorMsg = error.response?.data?.message || 'Không thể xóa nhân viên';
                            toastError('Cảnh báo', errorMsg);
                          }
                        }}
                        title="Xóa nhân viên"
                        message={`Bạn có chắc muốn xóa nhân viên "${assignment.staffName || 'này'}" khỏi chuyến xe?`}
                        buttonText=""
                        showIcon={true}
                        buttonSize="small"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#6B7280] italic mt-4">Chưa có nhân viên được phân công</p>
              )}
            </div>

            {/* Campers Section */}
            <div className="mt-6 pt-6 border-t border-[#E5E7EB]">
              <h4 className="text-sm font-bold text-[#111827] mb-4 flex items-center gap-2">
                <Users size={18} className="text-blue-500" />
                Trại Viên Đăng Ký ({scheduleCampers.length})
              </h4>
              {loadingCampers ? (
                <div className="flex justify-center py-4">
                  <Spin size="small" />
                </div>
              ) : scheduleCampers.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {scheduleCampers.map((camper: any) => (
                    <div
                      key={camper.camperTransportId}
                      className="flex items-center justify-between p-3 bg-[#F9FAFB] rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-[#111827]">
                          {camper.camper?.camperName || 'N/A'}
                        </p>
                        <p className="text-xs text-[#6B7280]">
                          📍 {camper.location?.name || 'N/A'}
                        </p>
                        {camper.checkInTime && (
                          <p className="text-xs text-green-600 mt-1">
                            ✓ Lên xe: {dayjs(camper.checkInTime).format('HH:mm DD/MM/YYYY')}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {camper.isAbsent ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                            Vắng mặt
                          </span>
                        ) : camper.checkInTime ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            Đã lên xe
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                            Chờ lên xe
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#6B7280] italic">Chưa có trại viên đăng ký</p>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-[#6B7280]">
            Không có dữ liệu
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TransportScheduleTab;
