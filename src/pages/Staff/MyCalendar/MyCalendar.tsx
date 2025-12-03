import React, { useEffect, useState, useCallback } from 'react';
import { List, Button, Select, Card, Spin, Typography, Empty } from 'antd';
import { VideoCameraOutlined, CalendarOutlined, EnvironmentOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import staffService from '../../../services/staffService';
import type { StaffCampResponseDto, ActivityScheduleInfo } from '../../../services/staffService';
import { useNotification } from '../../../contexts/NotificationContext';

const { Title, Text } = Typography;

const MyCalendar: React.FC = () => {
  const [camps, setCamps] = useState<StaffCampResponseDto[]>([]);
  const [selectedCampId, setSelectedCampId] = useState<number | null>(null);
  const [activities, setActivities] = useState<ActivityScheduleInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [activitiesLoading, setActivitiesLoading] = useState<boolean>(false);
  const { toastError, toastInfo } = useNotification();

  const fetchCamps = useCallback(async () => {
    try {
      setLoading(true);
      const data = await staffService.getStaffCamps();
      setCamps(data);
      if (data.length > 0) {
        setSelectedCampId(data[0].campId);
      }
    } catch (error) {
      console.error("Error fetching camps:", error);
      toastError("Lỗi", "Không thể tải danh sách trại.");
    } finally {
      setLoading(false);
    }
  }, [toastError]);

  const fetchActivities = useCallback(async (campId: number) => {
    try {
      setActivitiesLoading(true);
      const data = await staffService.getCampActivities(campId);
      // The API returns an object with an 'activities' array
      setActivities(data.activities || []);
    } catch (error) {
      console.error("Error fetching activities:", error);
      toastError("Lỗi", "Không thể tải danh sách hoạt động.");
    } finally {
      setActivitiesLoading(false);
    }
  }, [toastError]);

  useEffect(() => {
    fetchCamps();
  }, [fetchCamps]);

  useEffect(() => {
    if (selectedCampId) {
      fetchActivities(selectedCampId);
    } else {
      setActivities([]);
    }
  }, [selectedCampId, fetchActivities]);

  const handleStartStream = async (activity: ActivityScheduleInfo) => {
    try {
      setActivitiesLoading(true);
      
      // 1. Check if already has livestream
      const schedule = await activityScheduleService.getActivityScheduleById(
        activity.activityScheduleId
      );
      
      let roomId: string;
      
      if (schedule.liveStream?.roomId) {
        // Already has room, reuse it
        roomId = schedule.liveStream.roomId;
        toastInfo("Thông báo", "Sử dụng phòng livestream đã có");
      } else {
        // Create new VideoSDK room
        const videoSDKService = (await import("../../../services/videoSDKService")).default;
        roomId = await videoSDKService.createRoom();
        
        // Save to backend
        const liveStreamService = (await import("../../../services/liveStreamService")).default;
        await liveStreamService.createLiveStream({
          title: activity.name,
          roomId: roomId,
          // hostId will be set by backend from auth token
        });
        
        toastInfo("Thành công", "Đã tạo phòng livestream mới");
      }
      
      // 2. Update isLivestream = true
      await activityScheduleService.updateLiveStreamStatus(
        activity.activityScheduleId,
        true
      );
      
      // 3. Navigate to host livestream page
      navigate(`/staff/livestream/host/${roomId}`, {
        state: {
          activityScheduleId: activity.activityScheduleId,
          activityName: activity.name,
        },
      });
      
    } catch (error) {
      console.error("Error starting stream:", error);
      toastError("Lỗi", "Không thể bắt đầu livestream. Vui lòng thử lại.");
    } finally {
      setActivitiesLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <Title level={2} className="!mb-0">Lịch hoạt động của tôi</Title>
        
        <div className="flex items-center gap-2">
          <Text strong>Chọn trại:</Text>
          <Select
            style={{ width: 250 }}
            placeholder="Chọn trại"
            value={selectedCampId}
            onChange={(value) => setSelectedCampId(value)}
            loading={loading}
            options={camps.map(camp => ({ label: camp.name, value: camp.campId }))}
          />
        </div>
      </div>

      {activitiesLoading ? (
        <div className="flex justify-center py-20">
          <Spin size="large" tip="Đang tải hoạt động..." />
        </div>
      ) : (
        <List
          grid={{ gutter: 16, column: 1 }}
          dataSource={activities}
          rowKey="activityScheduleId"
          locale={{ emptyText: <Empty description="Không có hoạt động nào trong trại này" /> }}
          renderItem={item => (
            <List.Item>
              <Card
                className="shadow-sm hover:shadow-md transition-shadow"
                actions={[
                  <Button 
                    type="primary" 
                    icon={<VideoCameraOutlined />} 
                    onClick={() => handleStartStream(item.activityScheduleId)}
                    className="bg-red-500 hover:bg-red-600 border-red-500 hover:border-red-600"
                  >
                    Start Live Stream
                  </Button>
                ]}
              >
                <List.Item.Meta
                  title={
                    <div className="flex justify-between items-start">
                      <Text strong style={{ fontSize: '1.1rem' }}>{item.name}</Text>
                      {/* You could add status badge here if available */}
                    </div>
                  }
                  description={
                    <div className="space-y-2 mt-3">
                      <div className="flex items-center text-gray-600">
                        <CalendarOutlined className="mr-2 text-blue-500" />
                        <span className="font-medium">
                          {dayjs(item.startTime).format('DD/MM/YYYY')}
                        </span>
                        <span className="mx-2">|</span>
                        <span>
                          {dayjs(item.startTime).format('HH:mm')} - {dayjs(item.endTime).format('HH:mm')}
                        </span>
                      </div>
                      
                      {item.location && (
                        <div className="flex items-center text-gray-600">
                          <EnvironmentOutlined className="mr-2 text-green-500" />
                          <span>{item.location}</span>
                        </div>
                      )}
                    </div>
                  }
                />
              </Card>
            </List.Item>
          )}
        />
      )}
    </div>
  );
};

export default MyCalendar;
