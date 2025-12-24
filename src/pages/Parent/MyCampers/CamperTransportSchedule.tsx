import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Spin, Empty, Tag, Card, Row, Col, Typography, Button, Modal, Descriptions } from "antd";
import { ArrowLeftOutlined, CarOutlined, UserOutlined, EnvironmentOutlined, EyeOutlined, ClockCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import transportScheduleService, { type TransportScheduleResponseDto } from "../../../services/transportScheduleService";
import camperTransportService, { type CamperTransportResponseDto } from "../../../services/camperTransportService";
import { useNotification } from "../../../contexts/NotificationContext";
import { TransportScheduleStatus } from "../../../enums/transportSchedule-status.enum";

const { Title, Text } = Typography;

const CamperTransportSchedule: React.FC = () => {
  const { camperId, campId } = useParams<{ camperId: string; campId: string }>();
  const navigate = useNavigate();
  const { toastError } = useNotification();
  const [loading, setLoading] = useState(false);
  const [schedules, setSchedules] = useState<TransportScheduleResponseDto[]>([]);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<TransportScheduleResponseDto | null>(null);
  const [camperTransportDetails, setCamperTransportDetails] = useState<CamperTransportResponseDto[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    const fetchSchedules = async () => {
      if (!camperId || !campId) return;
      try {
        setLoading(true);
        const data = await transportScheduleService.getSchedulesByCamperIdAndCampId(
          Number(camperId),
          Number(campId)
        );
            
        const sorted = data.sort((a, b) => {
            const dateDiff = dayjs(a.date).diff(dayjs(b.date));
            if (dateDiff !== 0) return dateDiff;
            return a.startTime.localeCompare(b.startTime);
        });

        setSchedules(sorted);
      } catch (error: any) {
        console.error("Failed to fetch transport schedules:", error);
        toastError('Cảnh báo', "Không thể tải lịch đưa đón.");
      } finally {
        setLoading(false);
      }
    };
    fetchSchedules();
  }, [camperId, campId, toastError]);

  const handleViewDetail = async (schedule: TransportScheduleResponseDto) => {
    setSelectedSchedule(schedule);
    setDetailModalVisible(true);
    
    try {
      setDetailLoading(true);
      const details = await camperTransportService.getCamperTransportsBySchedule(
        schedule.transportScheduleId,
        Number(camperId)
      );
      setCamperTransportDetails(details);
    } catch (error: any) {
      console.error("Failed to fetch camper transport details:", error);
      toastError('Cảnh báo', "Không thể tải chi tiết đưa đón.");
      setCamperTransportDetails([]);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCloseModal = () => {
    setDetailModalVisible(false);
    setSelectedSchedule(null);
    setCamperTransportDetails([]);
  };

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
                                    <Button
                                        type="primary"
                                        icon={<EyeOutlined />}
                                        onClick={() => handleViewDetail(schedule)}
                                        className="bg-[#FF8F50] hover:bg-[#ff7e3d] border-none mt-2"
                                    >
                                        Xem chi tiết
                                    </Button>
                                </Col>
                             </Row>
                        </Card>
                    ))}
                </div>
            )}

            <Modal
                title={
                    <div className="text-lg font-semibold">
                        Chi Tiết Lịch Đưa Đón
                    </div>
                }
                open={detailModalVisible}
                onCancel={handleCloseModal}
                footer={[
                    <Button key="close" onClick={handleCloseModal}>
                        Đóng
                    </Button>
                ]}
                width={800}
            >
                {selectedSchedule && (
                    <div className="space-y-4">
                        <Card className="bg-gray-50">
                            <Descriptions column={2} bordered size="small">
                                <Descriptions.Item label="Ngày:" span={1}>
                                    {dayjs(selectedSchedule.date).format('DD/MM/YYYY')}
                                </Descriptions.Item>
                                <Descriptions.Item label="Loại chuyến:" span={1}>
                                    <Tag color={selectedSchedule.transportType?.toUpperCase() === 'PICKUP' ? 'blue' : 'green'}>
                                        {getTransportTypeDisplay(selectedSchedule.transportType)}
                                    </Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label="Thời gian:" span={2}>
                                    {selectedSchedule.startTime.substring(0, 5)} - {selectedSchedule.endTime.substring(0, 5)}
                                </Descriptions.Item>
                                <Descriptions.Item label="Tuyến đường:" span={2}>
                                    {selectedSchedule.routeName.routeName || "Chưa cập nhật"}
                                </Descriptions.Item>
                                <Descriptions.Item label="Phương tiện:" span={2}>
                                    {selectedSchedule.vehicleName.vehicleName || "Chưa cập nhật"} 
                                    {selectedSchedule.vehicleName.vehicleNumber && ` (${selectedSchedule.vehicleName.vehicleNumber})`}
                                </Descriptions.Item>
                                <Descriptions.Item label="Tài xế:" span={2}>
                                    {selectedSchedule.driverFullName.fullName || "Chưa cập nhật"}
                                </Descriptions.Item>
                                <Descriptions.Item label="Trạng thái chuyến xe:" span={2}>
                                    {renderStatusTag(selectedSchedule.status)}
                                </Descriptions.Item>
                            </Descriptions>
                        </Card>

                        <div className="mt-4">
                            <Title level={5} className="mb-3">Thông Tin Camper</Title>
                            {detailLoading ? (
                                <div className="flex justify-center py-8">
                                    <Spin />
                                </div>
                            ) : camperTransportDetails.length === 0 ? (
                                <Empty description="Không có thông tin camper" />
                            ) : (
                                <div className="space-y-3">
                                    {camperTransportDetails.map((detail) => (
                                        <Card key={detail.camperTransportId} className="shadow-sm">
                                            <Descriptions column={2} size="small">
                                                <Descriptions.Item label="Tên Camper" span={2}>
                                                    <Text strong>{detail.camper.camperName || "Không xác định"}</Text>
                                                </Descriptions.Item>
                                                <Descriptions.Item label="Địa điểm đón/trả" span={2}>
                                                    <EnvironmentOutlined className="mr-2" />
                                                    {detail.location.name || "Chưa cập nhật"}
                                                </Descriptions.Item>
                                                <Descriptions.Item label="Trạng thái" span={1}>
                                                    <Tag color={detail.status === 'Completed' ? 'green' : 'blue'}>
                                                        {detail.status === 'Completed' ? 'Hoàn thành' : 
                                                         detail.status === 'Pending' ? 'Chờ xử lý' : detail.status}
                                                    </Tag>
                                                </Descriptions.Item>
                                                <Descriptions.Item label="Vắng mặt" span={1}>
                                                    <Tag color={detail.isAbsent ? 'red' : 'green'}>
                                                        {detail.isAbsent ? 'Có' : 'Không'}
                                                    </Tag>
                                                </Descriptions.Item>
                                                {detail.checkInTime && (
                                                    <Descriptions.Item label="Giờ lên xe" span={1}>
                                                        <ClockCircleOutlined className="mr-2" />
                                                        {dayjs(detail.checkInTime).format('HH:mm DD/MM/YYYY')}
                                                    </Descriptions.Item>
                                                )}
                                                {detail.checkOutTime && (
                                                    <Descriptions.Item label="Giờ xuống xe" span={1}>
                                                        <ClockCircleOutlined className="mr-2" />
                                                        {dayjs(detail.checkOutTime).format('HH:mm DD/MM/YYYY')}
                                                    </Descriptions.Item>
                                                )}
                                                {detail.note && (
                                                    <Descriptions.Item label="Ghi chú" span={2}>
                                                        <Text type="secondary">{detail.note}</Text>
                                                    </Descriptions.Item>
                                                )}
                                            </Descriptions>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    </div>
  );
};

export default CamperTransportSchedule;
