import React, { useEffect, useState, useMemo } from "react";
import { Spin, Empty, Collapse } from "antd";
import { SearchOutlined, EyeOutlined, CaretRightOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../services/userService";
import { useNotification } from "../../../contexts/NotificationContext";
import { PagePath } from "../../../enums/page-path.enum";
import transactionService, {
  type TransactionResponseDto,
} from "../../../services/transactionService";

const STATUS_OPTIONS = [
  { key: "Success", label: "Thành công" },
  { key: "Pending", label: "Chờ xử lý" },
  { key: "Failed", label: "Thất bại" },
  { key: "Cancelled", label: "Đã hủy" },
];

const MyTransaction: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { toastError } = useNotification();

  const [transactions, setTransactions] = useState<TransactionResponseDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

  // Fetch transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const data = await transactionService.getUserTransactions();
        setTransactions(data);
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message || "Không thể tải danh sách giao dịch";
        toastError("Lỗi", errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchTransactions();
    } else {
      navigate("/login");
    }
  }, [user, navigate, toastError]);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const matchSearch = (transaction.campName || "")
        .toLowerCase()
        .includes(searchText.toLowerCase());
      const matchStatus = selectedStatuses.length === 0 || selectedStatuses.includes(transaction.status);
      return matchSearch && matchStatus;
    });
  }, [transactions, searchText, selectedStatuses]);

  // Count transactions by status
  const getStatusCount = (status: string) => {
    return transactions.filter((trans) => trans.status === status).length;
  };

  // Get status info
  const getStatusInfo = (status: string) => {
    const statusMap: { [key: string]: { bg: string; text: string; label: string } } = {
      Success: { bg: "bg-green-100", text: "text-green-700", label: "Thành công" },
      Pending: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Chờ xử lý" },
      Failed: { bg: "bg-red-100", text: "text-red-700", label: "Thất bại" },
      Cancelled: { bg: "bg-gray-100", text: "text-gray-700", label: "Đã hủy" },
    };
    return statusMap[status] || { bg: "bg-gray-100", text: "text-gray-700", label: status };
  };

  // Get type display
  const getTypeDisplay = (type: string) => {
    const typeMap: { [key: string]: string } = {
      Payment: "Thanh toán",
      Refund: "Hoàn tiền",
      Deposit: "Đặt cọc",
    };
    return typeMap[type] || type;
  };

  if (loading && transactions.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white py-20">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-gray-600 font-medium">
            Đang tải danh sách giao dịch...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-20">
      {/* Header */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-5xl font-bold text-gray-900 mb-2">
          Lịch sử giao dịch của tôi
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Xem chi tiết các giao dịch thanh toán của bạn
        </p>

        {/* Search & Filter Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          {/* Search */}
          <div className="mb-6">
            <p className="text-sm font-bold text-gray-900 mb-3">Tìm kiếm:</p>
            <div className="relative">
              <SearchOutlined
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg"
                style={{ color: "gray" }}
              />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên trại hè..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF8F50] focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <p className="text-sm font-bold text-gray-900 mb-3">Trạng thái:</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedStatuses([])}
                className={`px-3 py-1 text-sm rounded-full font-medium transition-all ${
                  selectedStatuses.length === 0
                    ? "bg-[#FF8F50] text-white border-2 border-[#FF8F50]"
                    : "bg-orange-50 text-gray-700 border-2 border-dashed border-[#FF8F50] hover:bg-orange-100"
                }`}
              >
                Tất cả ({transactions.length})
              </button>
              {STATUS_OPTIONS.map((status) => {
                const count = getStatusCount(status.key);
                const isSelected = selectedStatuses.includes(status.key);
                return (
                  <button
                    key={status.key}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedStatuses(selectedStatuses.filter((s) => s !== status.key));
                      } else {
                        setSelectedStatuses([...selectedStatuses, status.key]);
                      }
                    }}
                    className={`px-3 py-1 text-sm rounded-full font-medium transition-all ${
                      isSelected
                        ? "bg-[#FF8F50] text-white border-2 border-[#FF8F50]"
                        : "bg-orange-50 text-gray-700 border-2 border-dashed border-[#FF8F50] hover:bg-orange-100"
                    }`}
                  >
                    {status.label} ({count})
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* List */}
        {filteredTransactions.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-12 text-center">
            <Empty
              description="Không tìm thấy giao dịch"
              style={{ marginBottom: 0 }}
            />
            <button
              onClick={() => navigate(PagePath.CAMP)}
              className="mt-6 px-6 py-2 bg-[#FF8F50] text-white rounded-full font-medium hover:bg-[#ff7e3d] transition-colors"
            >
              Khám phá trại hè
            </button>
          </div>
        ) : (
          <Collapse
            bordered={false}
            expandIcon={({ isActive }) => (
              <CaretRightOutlined
                rotate={isActive ? 90 : 0}
                style={{ color: "#FF8F50", fontSize: "16px", transition: "transform 0.3s" }}
              />
            )}
            items={filteredTransactions.map((transaction, index) => {
              const statusInfo = getStatusInfo(transaction.status);
              return {
                key: transaction.transactionId.toString(),
                style: {
                  marginBottom: 16,
                  background: "white",
                  borderRadius: "12px",
                  border: "1px solid #e5e7eb",
                  overflow: "hidden",
                },
                label: (
                  <div className="flex-1 flex items-center justify-between gap-4 py-3 px-2">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {/* Number */}
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <p className="text-sm font-bold text-gray-600">{index + 1}</p>
                      </div>

                      {/* Camp Name */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-gray-900 truncate">
                          {transaction.campName}
                        </h3>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-full ${statusInfo.bg} ${statusInfo.text}`}
                    >
                      {statusInfo.label}
                    </span>

                    {/* Amount */}
                    <div className="flex-shrink-0 text-center">
                      <p className="text-xs text-gray-500 font-medium mb-0.5">SỐ TIỀN</p>
                      <p className="text-sm font-bold text-[#FF8F50]">
                        {transaction.amount?.toLocaleString("vi-VN")} ₫
                      </p>
                    </div>

                    {/* Date */}
                    <div className="flex-shrink-0 text-center hidden sm:block">
                      <p className="text-xs text-gray-500 font-medium mb-0.5">NGÀY GIAO DỊCH</p>
                      <p className="text-sm text-gray-900 font-medium">
                        {dayjs(transaction.transactionTime).format("DD/MM/YYYY")}
                      </p>
                    </div>
                  </div>
                ),
                children: (
                  <div className="space-y-4">
                    {/* Transaction ID */}
                    <div>
                      <p className="text-xs text-gray-600 font-medium mb-1">
                        MÃ GIAO DỊCH
                      </p>
                      <p className="text-lg font-semibold text-gray-900">
                        {transaction.transactionCode}
                      </p>
                    </div>

                    {/* Type */}
                    <div>
                      <p className="text-xs text-gray-600 font-medium mb-1">
                        LOẠI GIAO DỊCH
                      </p>
                      <p className="text-gray-900 font-medium">
                        {getTypeDisplay(transaction.type)}
                      </p>
                    </div>

                    {/* Payment Method */}
                    <div>
                      <p className="text-xs text-gray-600 font-medium mb-1">
                        PHƯƠNG THỨC THANH TOÁN
                      </p>
                      <p className="text-gray-900 font-medium">
                        {transaction.method}
                      </p>
                    </div>

                    {/* Amount */}
                    <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                      <p className="text-xs text-gray-600 font-medium mb-1">
                        SỐ TIỀN
                      </p>
                      <p className="text-2xl font-bold text-[#FF8F50]">
                        {transaction.amount?.toLocaleString("vi-VN")} ₫
                      </p>
                    </div>

                    {/* Date & Time */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-600 font-medium mb-1">
                          NGÀY GIAO DỊCH
                        </p>
                        <p className="text-gray-900 font-medium">
                          {dayjs(transaction.transactionTime).format("DD/MM/YYYY")}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-medium mb-1">
                          GIỜ GIAO DỊCH
                        </p>
                        <p className="text-gray-900 font-medium">
                          {dayjs(transaction.transactionTime).format("HH:mm:ss")}
                        </p>
                      </div>
                    </div>

                    {/* Registration ID */}
                    <div>
                      <p className="text-xs text-gray-600 font-medium mb-1">
                        MÃ ĐƠN ĐĂNG KÝ
                      </p>
                      <p className="text-gray-900 font-medium">
                        #{transaction.registrationId}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="pt-4 border-t border-gray-200">
                      <button
                        onClick={() =>
                          navigate(
                            PagePath.USER_MYREGISTRATIONS_DETAIL.replace(
                              ":registrationId",
                              transaction.registrationId.toString()
                            )
                          )
                        }
                        className="w-full flex items-center justify-center gap-1 bg-blue-500 text-white font-medium py-2 px-4 rounded-full text-sm hover:bg-blue-600 transition-colors"
                      >
                        <EyeOutlined />
                        Xem đơn đăng ký
                      </button>
                    </div>
                  </div>
                ),
              };
            })}
            style={{ background: "transparent" }}
          />
        )}
      </div>
    </div>
  );
};

export default MyTransaction;
