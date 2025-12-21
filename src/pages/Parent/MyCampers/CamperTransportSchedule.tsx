import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Spin, Empty, Tag, Card, Row, Col, Typography, Button } from "antd";
import { ArrowLeftOutlined, CarOutlined, UserOutlined, EnvironmentOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import transportScheduleService, { type TransportScheduleResponseDto } from "../../../services/transportScheduleService";
import { useNotification } from "../../../contexts/NotificationContext";
import { TransportScheduleStatus } from "../../../enums/transportSchedule-status.enum";

const { Title, Text } = Typography;

const CamperTransportSchedule: React.FC = () => {
  const { camperId, campId } = useParams<{ camperId: string; campId: string }>();
  const navigate = useNavigate();
  const { toastError } = useNotification();
  const [loading, setLoading] = useState(false);
  const [schedules, setSchedules] = useState<TransportScheduleResponseDto[]>([]);

  useEffect(() => {
    const fetchSchedules = async () => {
      if (!camperId || !campId) return;
      try {
        setLoading(true);
        // Fetch schedules using getSchedulesByCamperIdAndCampId
        const data = await transportScheduleService.getSchedulesByCamperIdAndCampId(
          Number(camperId),
          Number(campId)
        );
            
        // Sort by date and start time
        const sorted = data.sort((a, b) => {
            const dateDiff = dayjs(a.date).diff(dayjs(b.date));
            if (dateDiff !== 0) return dateDiff;
            // Compare times as strings (HH:mm:ss format)
            return a.startTime.localeCompare(b.startTime);
        });

        setSchedules(sorted);
      } catch (error: any) {
        console.error("Failed to fetch transport schedules:", error);
        toastError("Lỗi", "Không thể tải lịch đưa đón.");
      } finally {
        setLoading(false);
      }
    };
    fetchSchedules();
  }, [camperId, campId, toastError]);

  const renderStatusTag = (status: string) => {
    let color = 'default';
    let text = status;
    switch (status) {
        case TransportScheduleStatus.NOT_YET:
            color = 'blue';
            text = 'Chưa khởi hành';
            break;
        case TransportScheduleStatus.IN_PROGRESS:
            color = 'orange';
            text = 'Đang di chuyển';
            break;
        case TransportScheduleStatus.COMPLETED:
            color = 'green';
            text = 'Hoàn thành';
            break;
        case TransportScheduleStatus.CANCELED:
            color = 'red';
            text = 'Đã hủy';
            break;
    }
    return <Tag color={color}>{text}</Tag>;
  };

  const getTransportTypeDisplay = (type: string | null) => {
      if (!type) return "Không xác định";
      const upperType = type.toUpperCase();
      return upperType === "PICKUP" ? "Chuyến Đón" : upperType === "DROPOFF" ? "Chuyến Trả" : type;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
             <Button 
                onClick={() => navigate(-1)}
                className="flex bg-[#FF8F50] text-white items-center gap-2 hover:text-[#ffffff] font-semibold group px-6 py-2 rounded-full hover:shadow-lg hover:bg-[#ff7e3d] transition-all mb-6 border-none h-auto"
            >
                <ArrowLeftOutlined className="group-hover:-translate-x-1 transition-transform" />
                <span>Quay lại</span>
            </Button>
            
            <Title level={2} className="mb-8 text-center text-gray-800">Lịch Đưa Đón</Title>

            {schedules.length === 0 ? (
                 <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                    <Empty description="Không có lịch đưa đón nào." />
                </div>
            ) : (
                <div className="space-y-4">
                    {schedules.map(schedule => (
                        <Card key={schedule.transportScheduleId} className="shadow-sm hover:shadow-md transition-shadow border border-gray-200 rounded-xl overflow-hidden">
                             <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                                 schedule.transportType?.toUpperCase() === 'PICKUP' ? 'bg-blue-500' : 'bg-green-500'
                             }`}></div>
                             <Row gutter={[16, 16]} align="middle" className="pl-2">
                                <Col xs={24} md={6}>
                                    <div className="text-center md:text-left bg-gray-50 p-3 rounded-lg">
                                        <Text strong className="block text-lg text-gray-800">{dayjs(schedule.date).format('DD/MM/YYYY')}</Text>
                                        <Text type="secondary" className="block mt-1">
                                            {schedule.startTime.substring(0, 5)} - {schedule.endTime.substring(0, 5)}
                                        </Text>
                                        <Tag color={schedule.transportType?.toUpperCase() === 'PICKUP' ? 'blue' : 'green'} className="mt-2 mx-0">
                                            {getTransportTypeDisplay(schedule.transportType)}
                                        </Tag>
                                    </div>
                                </Col>
                                <Col xs={24} md={12}>
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-3">
                                            <EnvironmentOutlined className="mt-1 text-gray-400" />
                                            <div>
                                                <Text type="secondary" className="text-xs uppercase tracking-wide">Tuyến đường</Text>
                                                <div className="font-medium">{schedule.routeName.routeName || "Chưa cập nhật"}</div>
                                            </div>
                                        </div>
                                         <div className="flex items-center gap-3">
                                            <CarOutlined className="text-gray-400"/>
                                            <div>
                                                <Text type="secondary" className="text-xs uppercase tracking-wide">Phương tiện</Text>
                                                <div className="font-medium">
                                                    {schedule.vehicleName.vehicleName || "Chưa cập nhật"} 
                                                    {schedule.vehicleName.vehicleNumber && ` (${schedule.vehicleName.vehicleNumber})`}
                                                </div>
                                            </div>
                                        </div>
                                         <div className="flex items-center gap-3">
                                            <UserOutlined className="text-gray-400"/>
                                            <div>
                                                <Text type="secondary" className="text-xs uppercase tracking-wide">Tài xế</Text>
                                                <div className="font-medium">{schedule.driverFullName.fullName || "Chưa cập nhật"}</div>
                                            </div>
                                        </div>
                                    </div>
                                </Col>
                                <Col xs={24} md={6} className="text-center md:text-right flex flex-col items-center md:items-end justify-center gap-2">
                                    {renderStatusTag(schedule.status)}
                                    {schedule.actualStartTime && (
                                         <Text type="secondary" className="text-xs">
                                            Thực tế: {schedule.actualStartTime.substring(0, 5)}
                                        </Text>
                                    )}
                                </Col>
                             </Row>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    </div>
  );
};

export default CamperTransportSchedule;
