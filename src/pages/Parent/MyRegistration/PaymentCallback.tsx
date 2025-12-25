import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Spin, Result, Button } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, WarningOutlined } from "@ant-design/icons";
import { PagePath } from "../../../enums/page-path.enum";
import { useNotification } from "../../../contexts/NotificationContext";

interface PaymentCallbackResponse {
  isSuccess: boolean;
  orderCode: number;
  status: string;
  message: string;
  detail?: string;
}

const PaymentCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toastSuccess, toastError } = useNotification();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<PaymentCallbackResponse | null>(null);

  useEffect(() => {
    // Get query parameters from URL
    const code = searchParams.get("code");
    const id = searchParams.get("id");
    const cancel = searchParams.get("cancel");
    const status = searchParams.get("status");
    const orderCode = searchParams.get("orderCode");

    console.log("Payment Callback Parameters:", {
      code,
      id,
      cancel,
      status,
      orderCode,
    });

    // Process payment callback
    const processPaymentCallback = async () => {
      try {
        const normalizedStatus = (status || "UNKNOWN").toUpperCase();
        
        // Parse the response based on URL parameters
        const callbackResponse: PaymentCallbackResponse = {
          isSuccess: normalizedStatus === "PAID" || normalizedStatus === "SUCCESS",
          orderCode: orderCode ? parseInt(orderCode) : 0,
          status: normalizedStatus,
          message: getMessageByStatus(normalizedStatus),
          detail: getDetailByStatus(normalizedStatus),
        };

        setResult(callbackResponse);

        // Show toast notification
        if (callbackResponse.isSuccess) {
          toastSuccess("Thanh toán thành công!", callbackResponse.message);
        } else if (normalizedStatus === "CANCELLED" || normalizedStatus === "CANCELED") {
          toastError("Đã hủy thanh toán", callbackResponse.message);
        } else if (normalizedStatus === "PENDING") {
          toastError("Thanh toán đang xử lý", callbackResponse.message);
        } else {
          toastError("Thanh toán thất bại", callbackResponse.message);
        }

        // Wait a bit before hiding loading
        await new Promise(resolve => setTimeout(resolve, 800));
      } catch (error) {
        console.error("Error processing payment callback:", error);
        setResult({
          isSuccess: false,
          orderCode: 0,
          status: "ERROR",
          message: "Có lỗi xảy ra khi xử lý kết quả thanh toán",
          detail: "Vui lòng liên hệ bộ phận hỗ trợ nếu bạn đã thanh toán thành công.",
        });
        toastError('Cảnh báo', "Không thể xử lý kết quả thanh toán");
      } finally {
        setLoading(false);
      }
    };

    processPaymentCallback();
  }, [searchParams, toastSuccess, toastError]);

  const getMessageByStatus = (status: string): string => {
    const normalizedStatus = status.toUpperCase();
    switch (normalizedStatus) {
      case "PAID":
      case "SUCCESS":
        return "Thanh toán thành công!";
      case "CANCELLED":
      case "CANCELED":
        return "Giao dịch chưa hoàn tất.";
      case "PENDING":
        return "Thanh toán đang được xử lý.";
      case "FAILED":
        return "Thanh toán thất bại.";
      default:
        return "Trạng thái thanh toán không xác định.";
    }
  };

  const getDetailByStatus = (status: string): string => {
    const normalizedStatus = status.toUpperCase();
    switch (normalizedStatus) {
      case "PAID":
      case "SUCCESS":
        return "Đăng ký của bạn đã được xác nhận. Cảm ơn bạn đã sử dụng dịch vụ!";
      case "CANCELLED":
      case "CANCELED":
        return "Bạn có thể thử thanh toán lại từ lịch sử đăng ký.";
      case "PENDING":
        return "Chúng tôi sẽ cập nhật trạng thái thanh toán sớm nhất.";
      case "FAILED":
        return "Vui lòng kiểm tra lại thông tin thanh toán và thử lại.";
      default:
        return "Vui lòng kiểm tra lịch sử đăng ký để biết thêm chi tiết.";
    }
  };

  const getResultStatus = (): "success" | "error" | "info" | "warning" => {
    if (!result) return "info";
    
    switch (result.status) {
      case "PAID":
      case "SUCCESS":
        return "success";
      case "CANCELLED":
      case "FAILED":
        return "error";
      case "PENDING":
        return "warning";
      default:
        return "info";
    }
  };

  const getResultIcon = () => {
    if (!result) return null;
    
    switch (result.status) {
      case "PAID":
      case "SUCCESS":
        return <CheckCircleOutlined style={{ fontSize: 72, color: "#52c41a" }} />;
      case "CANCELLED":
        return <CloseCircleOutlined style={{ fontSize: 72, color: "#ff4d4f" }} />;
      case "FAILED":
        return <WarningOutlined style={{ fontSize: 72, color: "#ff4d4f" }} />;
      case "PENDING":
        return <ClockCircleOutlined style={{ fontSize: 72, color: "#faad14" }} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-gray-600 text-lg font-medium">
            Đang xử lý kết quả thanh toán...
          </p>
          <p className="mt-2 text-gray-500 text-sm">
            Vui lòng không đóng trang này
          </p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Result
          status="error"
          title="Không thể xử lý kết quả thanh toán"
          subTitle="Không tìm thấy thông tin giao dịch. Vui lòng liên hệ bộ phận hỗ trợ."
          extra={[
            <Button
              key="registrations"
              type="primary"
              size="large"
              onClick={() => navigate(PagePath.USER_MYREGISTRATIONS)}
            >
              Xem danh sách đăng ký
            </Button>,
            <Button
              key="home"
              size="large"
              onClick={() => navigate(PagePath.HOME)}
            >
              Về trang chủ
            </Button>,
          ]}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-2xl w-full">
        <Result
          status={getResultStatus()}
          icon={getResultIcon()}
          title={
            <span className="text-2xl font-bold">
              {result.message}
            </span>
          }
          subTitle={
            <div className="space-y-2 mt-4">
              <p className="text-gray-600 text-base">{result.detail}</p>
              {result.orderCode > 0 && (
                <p className="text-sm text-gray-500 mt-3">
                  Mã đơn hàng: <span className="font-semibold text-gray-700">#{result.orderCode}</span>
                </p>
              )}
            </div>
          }
          extra={[
            <Button
              key="registrations"
              type="primary"
              size="large"
              onClick={() => navigate(PagePath.USER_MYREGISTRATIONS)}
              className="h-12 px-8 text-base font-medium"
              style={{
                backgroundColor: result.isSuccess ? "#52c41a" : "#6366F1",
                borderColor: result.isSuccess ? "#52c41a" : "#6366F1",
              }}
            >
              {result.isSuccess ? "Xem chi tiết đăng ký" : "Quay lại danh sách đăng ký"}
            </Button>,
            <Button
              key="home"
              size="large"
              onClick={() => navigate(PagePath.HOME)}
              className="h-12 px-8 text-base font-medium"
            >
              Về trang chủ
            </Button>,
          ]}
        />

        {/* Transaction Details Card */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-blue-500 rounded"></span>
            Thông tin giao dịch
          </h3>
          <div className="space-y-3">
            {result.orderCode > 0 && (
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Mã đơn hàng:</span>
                <span className="font-semibold text-gray-900">#{result.orderCode}</span>
              </div>
            )}
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Trạng thái:</span>
              <span
                className={`font-semibold px-3 py-1 rounded-full text-sm ${
                  result.isSuccess
                    ? "bg-green-100 text-green-700"
                    : result.status === "PENDING"
                    ? "bg-yellow-100 text-yellow-700"
                    : result.status === "CANCELLED"
                    ? "bg-gray-100 text-gray-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {result.status}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Kết quả:</span>
              <span
                className={`font-semibold ${
                  result.isSuccess ? "text-green-600" : "text-red-600"
                }`}
              >
                {result.isSuccess ? "✓ Thành công" : "✗ Không thành công"}
              </span>
            </div>
          </div>
        </div>

        {/* Help Section for failed payments */}
        {!result.isSuccess && (
          <div className="mt-6 bg-blue-50 rounded-lg p-5 border border-blue-200">
            <div className="flex gap-3">
              <WarningOutlined className="text-blue-600 text-xl mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-blue-900 mb-2">
                  Cần hỗ trợ?
                </h4>
                <p className="text-sm text-blue-700 leading-relaxed">
                  Nếu bạn gặp vấn đề với thanh toán hoặc đã thanh toán nhưng giao dịch hiển thị thất bại, 
                  vui lòng liên hệ bộ phận hỗ trợ:
                </p>
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-blue-700">
                    📧 Email: 
                    <a href="mailto:support@summercamp.com" className="font-semibold underline ml-1">
                      support@summercamp.com
                    </a>
                  </p>
                  <p className="text-sm text-blue-700">
                    📞 Hotline: <span className="font-semibold">1900-xxxx</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success Info */}
        {result.isSuccess && (
          <div className="mt-6 bg-green-50 rounded-lg p-5 border border-green-200">
            <div className="flex gap-3">
              <CheckCircleOutlined className="text-green-600 text-xl mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-green-900 mb-2">
                  Thanh toán thành công!
                </h4>
                <p className="text-sm text-green-700 leading-relaxed">
                  Chúng tôi đã nhận được thanh toán của bạn. Thông tin chi tiết về đăng ký 
                  đã được gửi đến email của bạn. Bạn có thể xem chi tiết trong mục 
                  "Danh sách đăng ký của tôi".
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentCallback;
