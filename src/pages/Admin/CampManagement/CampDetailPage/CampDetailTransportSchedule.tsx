import React, { useEffect, useState, useCallback } from 'react';
import { Spin, Tag, Modal } from 'antd';
import { Calendar, Clock, User, Truck, MapPin, ArrowUpCircle, ArrowDownCircle, Eye } from 'lucide-react';
import { useNotification } from '../../../../contexts/NotificationContext';
import transportScheduleService, {
  type TransportScheduleResponseDto,
} from '../../../../services/transportScheduleService';
import campService, { type CampResponseDto } from '../../../../services/campService';

interface CampDetailTransportScheduleProps {
  campId: number;
  campStatus?: string;
}

const CampDetailTransportSchedule: React.FC<CampDetailTransportScheduleProps> = ({
  campId,
  campStatus,
}) => {
  const { toastError } = useNotification();

  const [schedules, setSchedules] = useState<TransportScheduleResponseDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [camp, setCamp] = useState<CampResponseDto | null>(null);
  
  // Detail Modal States
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [scheduleDetail, setScheduleDetail] = useState<TransportScheduleResponseDto | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Fetch camp details and schedules
  const fetchCampDetails = useCallback(async () => {
    if (!campId) return;
    try {
      const campData = await campService.getCampById(campId);
      setCamp(campData);
    } catch (error) {
      console.error('Failed to load camp details:', error);
    }
  }, [campId]);

  const fetchSchedules = useCallback(async () => {
    if (!campId) return;
    try {
      setLoading(true);
      const data = await transportScheduleService.getTransportSchedules({
        campId: campId ?? undefined,
      });
      setSchedules(data);
    } catch (error) {
      console.error('Failed to load schedules:', error);
      toastError('Cảnh báo', 'Không thể tải lịch trình đưa đón');
    } finally {
      setLoading(false);
    }
  }, [campId, toastError]);

  useEffect(() => {
    if (!campId) {
      setSchedules([]);
      setCamp(null);
      return;
    }

    fetchCampDetails();
    fetchSchedules();
  }, [campId, fetchCampDetails, fetchSchedules]);

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
    return time.substring(0, 5);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-GB');
  };

  const handleViewDetails = async (scheduleId: number) => {
    try {
      setLoadingDetail(true);
      setIsDetailModalVisible(true);
      const detail = await transportScheduleService.getTransportScheduleById(scheduleId);
      setScheduleDetail(detail);
    } catch (error) {
      console.error('Failed to load schedule details:', error);
      toastError('Cảnh báo', 'Không thể tải chi tiết lịch trình');
      setIsDetailModalVisible(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Split schedules by type
  const pickupSchedules = schedules.filter(s => s.transportType === 'PickUp');
  const dropoffSchedules = schedules.filter(s => s.transportType === 'DropOff');

  if (campStatus === 'Draft' || campStatus === 'DRAFT') {
    return (
      <div className="pb-12">
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-8">
          <div className="text-center">
            <h3 className="text-xl font-bold text-blue-900 mb-2">
              Trại chưa được thiết lập
            </h3>
            <p className="text-blue-700 mb-4">
              Trại của bạn vẫn đang ở trạng thái 'Draft'. Vui lòng hoàn thành thiết lập trại để tiếp tục.
            </p>
            <p className="text-sm text-blue-600">
              Vui lòng chỉ định một quản lý và chờ họ thiết lập trại để tiếp tục.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="pb-12">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#111827]">
          Lịch trình Đưa Đón
        </h1>
        <p className="text-[#6B7280] text-sm mt-1">
          Xem lịch trình đưa đón cho trại này (Chỉ xem)
        </p>
      </div>

      {/* Camp Date Info */}
      {camp && (
        <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-indigo-200 rounded-xl p-6">
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
                Lịch đón ({pickupSchedules.length})
              </h2>
            </div>
          </div>

          <div className="divide-y divide-[#E5E7EB]">
            {pickupSchedules.length === 0 ? (
              <div className="px-6 py-12 text-center text-[#6B7280]">
                <ArrowUpCircle size={48} className="mx-auto mb-4 text-[#9CA3AF]" />
                <p>Chưa có lịch đón</p>
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
                      <button
                        onClick={() => handleViewDetails(schedule.transportScheduleId)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all font-medium text-sm"
                      >
                        <Eye size={16} />
                        Chi tiết
                      </button>
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
                Lịch trả ({dropoffSchedules.length})
              </h2>
            </div>
          </div>

          <div className="divide-y divide-[#E5E7EB]">
            {dropoffSchedules.length === 0 ? (
              <div className="px-6 py-12 text-center text-[#6B7280]">
                <ArrowDownCircle size={48} className="mx-auto mb-4 text-[#9CA3AF]" />
                <p>Chưa có lịch trả</p>
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
                      <button
                        onClick={() => handleViewDetails(schedule.transportScheduleId)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all font-medium text-sm"
                      >
                        <Eye size={16} />
                        Chi tiết
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

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
                    <span className="text-xs font-semibold text-[#6B7280] uppercase block mb-1">Loại</span>
                    <p className="text-sm font-bold text-[#111827]">
                      {scheduleDetail.transportType === 'PickUp' ? 'Đón' : 'Trả'}
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

export default CampDetailTransportSchedule;
