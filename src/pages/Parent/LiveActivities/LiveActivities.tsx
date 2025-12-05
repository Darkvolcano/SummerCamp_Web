import React, { useState, useEffect, useCallback } from 'react';
import { Card, Spin, Empty, Button } from 'antd';
import { VideoCameraOutlined, CalendarOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import activityScheduleService from '../../../services/activityScheduleService';
import type { ActivityScheduleResponseDto } from '../../../services/activityScheduleService';
import { useNotification } from '../../../contexts/NotificationContext';

interface LiveActivitiesProps {
  campId: number;
  camperId: number;
}

const LiveActivities: React.FC<LiveActivitiesProps> = ({ campId, camperId }) => {
  const [liveActivities, setLiveActivities] = useState<ActivityScheduleResponseDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { toastError } = useNotification();
  const navigate = useNavigate();

  const fetchLiveActivities = useCallback(async () => {
    try {
      setLoading(true);
      const schedules = await activityScheduleService.getActivitySchedulesByCamperAndCamp(
        campId,
        camperId
      );
      
      // Filter only livestreaming activities
      const live = schedules.filter(s => s.isLivestream);
      setLiveActivities(live);
    } catch (error) {
      console.error("Error fetching live activities:", error);
      toastError("Lỗi", "Không thể tải danh sách hoạt động đang phát trực tiếp");
    } finally {
      setLoading(false);
    }
  }, [campId, camperId, toastError]);

  useEffect(() => {
    fetchLiveActivities();
    
    // Poll every 30 seconds to check for new live activities
    const interval = setInterval(fetchLiveActivities, 30000);
    return () => clearInterval(interval);
  }, [fetchLiveActivities]);

  const handleWatchLive = (activity: ActivityScheduleResponseDto) => {
    if (activity.liveStream?.roomId) {
      // Navigate to livestream viewer page
      navigate(`/parent/livestream/view/${activity.liveStream.roomId}`);
    } else {
      toastError("Lỗi", "Không tìm thấy phòng livestream");
    }
  };

  if (loading && liveActivities.length === 0) {
    return (
      <div className="flex justify-center py-8">
        <Spin size="large" tip="Đang tải hoạt động trực tiếp..." />
      </div>
    );
  }

  if (liveActivities.length === 0) {
    return (
      <Card className="shadow-sm">
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Hiện tại không có hoạt động nào đang phát trực tiếp"
        />
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-xl font-bold text-gray-900 m-0">
          🔴 Hoạt động đang phát trực tiếp
        </h3>
        <span className="text-sm text-gray-500">
          ({liveActivities.length})
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {liveActivities.map(activity => (
          <Card
            key={activity.activityScheduleId}
            className="shadow-md hover:shadow-lg transition-shadow border-2 border-red-500"
            hoverable
          >
            {/* Live Indicator */}
            <div className="flex items-center gap-2 mb-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              <span className="text-red-600 font-bold text-sm uppercase tracking-wide">
                LIVE NOW
              </span>
            </div>

            {/* Activity Name */}
            <h4 className="text-lg font-bold text-gray-900 mb-3">
              {activity.activity?.name || 'Hoạt động không xác định'}
            </h4>

            {/* Activity Details */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center text-gray-600 text-sm">
                <CalendarOutlined className="mr-2 text-blue-500" />
                <span className="font-medium">
                  {dayjs(activity.startTime).format('DD/MM/YYYY')}
                </span>
                <span className="mx-2">|</span>
                <span>
                  {dayjs(activity.startTime).format('HH:mm')} - {dayjs(activity.endTime).format('HH:mm')}
                </span>
              </div>

              {activity.location && (
                <div className="flex items-center text-gray-600 text-sm">
                  <EnvironmentOutlined className="mr-2 text-green-500" />
                  <span>{activity.location.name}</span>
                </div>
              )}

              {activity.staff && (
                <div className="flex items-center text-gray-600 text-sm">
                  <span className="mr-2">👤</span>
                  <span>Giáo viên: {activity.staff.fullName}</span>
                </div>
              )}
            </div>

            {/* Watch Live Button */}
            <Button
              type="primary"
              icon={<VideoCameraOutlined />}
              onClick={() => handleWatchLive(activity)}
              className="w-full bg-red-500 hover:bg-red-600 border-red-500 hover:border-red-600"
              size="large"
            >
              Xem trực tiếp
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default LiveActivities;
