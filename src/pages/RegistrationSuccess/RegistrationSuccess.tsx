import React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button, Card, Typography, Divider, Row } from "antd";
import {
  CheckCircleFilled,
  ArrowLeftOutlined,
  FileTextOutlined,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

const RegistrationSuccess: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { registrationId } = useParams<{ registrationId: string }>();

  const { campName, finalPrice } = (location.state as {
    campName: string;
    finalPrice: number;
  }) || { campName: null, finalPrice: null };

  const isStateLost = !campName || finalPrice === null;

  return (
    <div className="min-h-screen py-16 bg-gradient-to-b from-white to-[#fff5e6]">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <Card bordered={false} className="shadow-lg rounded-3xl p-6 sm:p-12">
          <CheckCircleFilled className="text-7xl text-green-500 mb-6" />

          <Title level={2} className="!mb-4">
            Đăng ký thành công!
          </Title>

          <Paragraph className="text-lg text-gray-600">
            Cảm ơn bạn đã đăng ký. Đơn hàng của bạn đã được ghi nhận và đang chờ
            xử lý thanh toán.
          </Paragraph>

          <Divider />
          {isStateLost ? (
            <div className="my-6">
              <Text className="text-base text-gray-700">
                Mã đăng ký của bạn là:
                <Text strong code className="text-lg">
                  #{registrationId}
                </Text>
              </Text>
            </div>
          ) : (
            <div className="my-8 text-left space-y-4">
              <Title level={4}>Chi tiết đơn hàng</Title>

              <Row justify="space-between" className="text-base">
                <Text type="secondary">Trại hè</Text>

                <Text strong className="max-w-[70%] truncate">
                  {campName}
                </Text>
              </Row>

              <Row justify="space-between" className="text-base">
                <Text type="secondary">Mã đăng ký</Text>

                <Text strong code className="text-base">
                  #{registrationId}
                </Text>
              </Row>

              <Row justify="space-between" className="text-xl">
                <Text strong>Tổng thanh toán</Text>

                <Text strong className="text-orange-500">
                  {finalPrice.toLocaleString("vi-VN")} đ
                </Text>
              </Row>
            </div>
          )}
          <Divider />
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <Button
              type="default"
              size="large"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/camp")}
              className="font-semibold"
            >
              Khám phá trại hè khác
            </Button>

            <Button
              size="large"
              icon={<FileTextOutlined />}
              className="font-semibold bg-gradient-to-r from-[#FF8F50] to-[#ff7e3d] text-white border-none hover:!bg-gradient-to-l hover:!text-white"
              onClick={() => navigate("/my-registrations")}
            >
              Xem lịch sử đăng ký
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RegistrationSuccess;
