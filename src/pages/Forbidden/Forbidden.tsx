import { Button, Card, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { FrownOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const Forbidden = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#f0f2f5",
      }}
    >
      <Card
        style={{
          textAlign: "center",
          padding: "40px",
          maxWidth: "500px",
          borderRadius: "12px",
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
        }}
      >
        <FrownOutlined
          style={{ fontSize: "80px", color: "#fa541c", marginBottom: "20px" }}
        />
        <Title level={2} style={{ color: "#ff4d4f" }}>
          403 - Truy cập bị từ chối!
        </Title>
        <Text type="secondary">
          Bạn không có quyền truy cập vào trang này. Hãy kiểm tra quyền của bạn
          hoặc quay lại trang chủ.
        </Text>
        <div style={{ marginTop: "30px" }}>
          <Button type="primary" size="large" onClick={() => navigate(-1)}>
            Quay lại trang trước
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Forbidden;
