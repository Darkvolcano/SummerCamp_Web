import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Form,
  Input,
  Button,
  Select,
  Spin,
  message,
  Card,
  Row,
  Col,
  Typography,
  Divider,
  Empty,
} from "antd";
import {
  ArrowLeftOutlined,
  UserOutlined,
  DollarOutlined,
  PercentageOutlined,
  ShoppingCartOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import { useAuthStore } from "../../services/userService";
import campService, { type CampResponseDto } from "../../services/campService";
import registrationService, {
  type RegistrationRequestDto,
} from "../../services/registrationService";
import { CampStatus } from "../../enums/camp-status.enum";
import camperService, {
  type CamperResponseDto,
} from "../../services/camperService";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const RegistrationPage: React.FC = () => {
  const { campId } = useParams<{ campId: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { user } = useAuthStore();

  const [camp, setCamp] = useState<CampResponseDto | null>(null);
  const [campers, setCampers] = useState<CamperResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const rawCamperIds = Form.useWatch("camperIds", form) as number[] | undefined;
  const selectedCamperIds: number[] = useMemo(
    () => rawCamperIds || [],
    [rawCamperIds]
  );

  useEffect(() => {
    if (!user) {
      message.warning("Vui lòng đăng nhập để thực hiện đăng ký.");
      navigate("/login");
      return;
    }
    if (!campId) {
      message.error("Không tìm thấy ID trại hè.");
      navigate("/camp");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const [campData, camperData] = await Promise.all([
          campService.getCampById(parseInt(campId)),
          camperService.getMyCampers(),
        ]);

        if (campData.status !== CampStatus.OPEN_FOR_REGISTRATION) {
          message.warning("Trại hè này không còn mở đăng ký.");
          navigate(`/camp/${campId}`);
          return;
        }

        setCamp(campData);
        setCampers(camperData);

        form.setFieldsValue({
          camperIds: [],
          note: "",
        });
      } catch (error) {
        console.error("❌ [RegistrationPage] Error fetching data:", error);
        message.error("Không thể tải thông tin đăng ký.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [campId, navigate, form, user]);

  const onFinish = async (values: any) => {
    if (!camp) return;

    const requestData: RegistrationRequestDto = {
      camperIds: values.camperIds,
      campId: camp.campId,
      appliedPromotionId: camp.promotion ? camp.promotion.id : null,
      note: values.note || "",
    };

    setSubmitting(true);
    try {
      const response = await registrationService.createRegistration(
        requestData
      );
      console.log("✅ [RegistrationPage] Registration successful:", response);

      message.success("Đã tạo đơn đăng ký thành công!");
      navigate(`/register-success/${response.registrationId}`);
    } catch (error) {
      console.error(
        "❌ [RegistrationPage] Error creating registration:",
        error
      );
      message.error("Đã có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  const priceDetails = useMemo(() => {
    if (!camp) {
      return { basePrice: 0, discount: 0, finalPrice: 0, discountPercent: 0 };
    }

    const camperCount = selectedCamperIds.length;
    const basePrice = camp.price * camperCount;
    let discount = 0;
    let discountPercent = 0;

    const promotion = camp.promotion; // ‼️ LƯU Ý: Dùng `discountPercentage` // (Hãy chắc chắn file campService.ts của bạn đã map trường `percent` sang `discountPercentage`)
    if (promotion && promotion.percent) {
      discountPercent = promotion.percent;
      discount = (basePrice * discountPercent) / 100;
    }

    const finalPrice = basePrice - discount;
    return { basePrice, discount, finalPrice, discountPercent };
  }, [camp, selectedCamperIds]);

  if (loading) {
    return (
      // ‼️ STYLED: Dùng Tailwind
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-white to-[#fff5e6]">
        <Spin size="large" tip="Đang tải thông tin đăng ký..." />
      </div>
    );
  }

  if (!camp) {
    return (
      // ‼️ STYLED: Dùng Tailwind
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-white to-[#fff5e6]">
        <Empty description="Không tìm thấy thông tin trại hè." />
      </div>
    );
  }

  return (
    // ‼️ STYLED: Dùng Tailwind
    <div className="min-h-screen py-16 bg-gradient-to-b from-white to-[#fff5e6]">
      <div className="max-w-7xl mx-auto px-4">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(`/camp/${campId}`)}
          className="mb-4 font-semibold text-gray-600 hover:!text-orange-500"
        >
          Quay lại chi tiết
        </Button>

        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Row gutter={[32, 32]}>
            <Col xs={24} lg={14}>
              <div className="flex flex-col sm:flex-row gap-4 p-4 bg-white rounded-3xl shadow-lg mb-6">
                <img
                  src={
                    camp.image ||
                    "https://via.placeholder.com/400x300?text=Summer+Camp"
                  }
                  alt={camp.name}
                  className="w-full sm:w-32 h-48 sm:h-32 object-cover rounded-2xl"
                />

                <div className="flex flex-col flex-1">
                  <Text type="secondary" className="text-sm">
                    Bạn đang đăng ký cho
                  </Text>

                  <Title level={4} className="!mt-1 !mb-2 line-clamp-2">
                    {camp.name}
                  </Title>

                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <EnvironmentOutlined className="text-[#FF8F50]" />
                    <Text className="text-sm">{camp.place}</Text>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600">
                    <DollarOutlined className="text-[#FF8F50]" />

                    <Text className="text-sm font-semibold">
                      {camp.price.toLocaleString("vi-VN")}đ / bé
                    </Text>
                  </div>
                </div>
              </div>

              <Card
                bordered={false} // ‼️ STYLED: Đồng bộ bo góc
                className="shadow-lg rounded-3xl"
                title={
                  <Title level={3} className="!mb-0">
                    📝 Điền thông tin đăng ký
                  </Title>
                }
              >
                <Form.Item
                  name="camperIds"
                  label={<Text strong>Chọn bé tham gia</Text>}
                  rules={[
                    { required: true, message: "Vui lòng chọn ít nhất 1 bé" },
                  ]}
                >
                  <Select
                    mode="multiple"
                    size="large"
                    placeholder="Chọn các bé trong danh sách của bạn..."
                    loading={loading}
                    allowClear
                    filterOption={(input, option) =>
                      (option?.children as unknown as string)
                        ?.toLowerCase()
                        .includes(input.toLowerCase())
                    }
                  >
                    {campers.map((camper) => (
                      <Option key={camper.camperId} value={camper.camperId}>
                        {camper.camperName} ({camper.age} tuổi)
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                {campers.length === 0 && !loading && (
                  <Paragraph type="warning" className="!mt-[-12px] mb-4">
                    Bạn chưa thêm thông tin bé nào.
                    <Button
                      type="link"
                      onClick={() => navigate("/profile/campers")} // Giả định
                      className="!p-0 !ml-1"
                    >
                      Thêm bé ngay
                    </Button>
                  </Paragraph>
                )}

                <Form.Item
                  name="note"
                  label={<Text strong>Ghi chú (nếu có)</Text>}
                >
                  <Input.TextArea
                    rows={4}
                    placeholder="Ví dụ: Bé A bị dị ứng với hải sản, bé B cần uống thuốc lúc 12h trưa..."
                  />
                </Form.Item>
              </Card>
            </Col>

            <Col xs={24} lg={10}>
              <Card
                title={
                  <Title level={3} className="!mb-0">
                    <ShoppingCartOutlined /> Tóm tắt đơn hàng
                  </Title>
                }
                bordered={false}
                className="shadow-lg rounded-3xl sticky top-24"
              >
                <div className="space-y-3">
                  <Row justify="space-between">
                    <Text type="secondary" className="flex items-center gap-2">
                      <DollarOutlined /> Đơn giá mỗi bé
                    </Text>

                    <Text strong>{camp.price.toLocaleString("vi-VN")} đ</Text>
                  </Row>

                  <Row justify="space-between">
                    <Text type="secondary" className="flex items-center gap-2">
                      <UserOutlined /> Số lượng bé
                    </Text>

                    <Text strong>x {selectedCamperIds.length}</Text>
                  </Row>

                  <Row justify="space-between" className="text-lg">
                    <Text>Tạm tính</Text>
                    <Text strong>
                      {priceDetails.basePrice.toLocaleString("vi-VN")} đ
                    </Text>
                  </Row>

                  {priceDetails.discount > 0 && (
                    <Row
                      justify="space-between"
                      className="text-lg text-green-600"
                    >
                      <Text type="success" className="flex items-center gap-2">
                        <PercentageOutlined /> Giảm giá (
                        {priceDetails.discountPercent}%)
                      </Text>

                      <Text type="success" strong>
                        -{priceDetails.discount.toLocaleString("vi-VN")} đ
                      </Text>
                    </Row>
                  )}
                </div>
                <Divider />
                <Row justify="space-between" className="mb-6">
                  <Title level={4} className="!mb-0">
                    Tổng cộng
                  </Title>

                  <Title level={3} className="!mb-0 text-orange-500">
                    {priceDetails.finalPrice.toLocaleString("vi-VN")} đ
                  </Title>
                </Row>

                <Form.Item className="!mb-0">
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    className="w-full bg-gradient-to-r from-[#FF8F50] to-[#ff7e3d] hover:from-[#ff7e3d] hover:to-[#FF8F50] text-white font-bold py-4 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-lg disabled:from-gray-400 disabled:to-gray-500"
                    loading={submitting}
                    disabled={selectedCamperIds.length === 0 || submitting}
                  >
                    {submitting ? "Đang xử lý..." : "Tiếp tục thanh toán"}
                  </Button>
                </Form.Item>

                <Paragraph
                  type="secondary"
                  className="text-center text-xs mt-4"
                >
                  Bằng việc nhấn "Tiếp tục thanh toán", bạn đồng ý với các
                  <Button type="link" className="!text-xs !p-0 !ml-1">
                    điều khoản và điều kiện
                  </Button>
                  của chúng tôi.
                </Paragraph>
              </Card>
            </Col>
          </Row>
        </Form>
      </div>
    </div>
  );
};

export default RegistrationPage;
