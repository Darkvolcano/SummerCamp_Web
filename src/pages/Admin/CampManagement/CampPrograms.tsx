import React, { useState, useEffect } from "react";
import { Search, Eye, HousePlus, ArrowUpDown } from "lucide-react";
import { DatePicker, Spin } from "antd";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import campService, {
  type CampResponseDto,
} from "../../../services/campService";
import campTypeService, {
  type CampTypeResponseDto,
} from "../../../services/campTypeService";
import { CampStatus } from "../../../enums/camp-status.enum";
import CreateCampModal from "./CreateCampModal";

const CampPrograms: React.FC = () => {
  const navigate = useNavigate();
  const [camps, setCamps] = useState<CampResponseDto[]>([]);
  const [campTypes, setCampTypes] = useState<CampTypeResponseDto[]>([]);
  const [loading, setLoading] = useState(true);

  // Create Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");
  const [selectedCampType, setSelectedCampType] = useState<string>("All");

  // ✅ Changed: Empty array means "All" selected by default
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Sort by start date
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Status counts
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});

  // Fetch data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [campsData, typesData] = await Promise.all([
        campService.getAllCamps(),
        campTypeService.getAllCampTypes(),
      ]);
      setCamps(campsData);
      setCampTypes(typesData);
      calculateStatusCounts(campsData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStatusCounts = (data: CampResponseDto[]) => {
    const counts: Record<string, number> = {};
    data.forEach((camp) => {
      counts[camp.status] = (counts[camp.status] || 0) + 1;
    });
    setStatusCounts(counts);
  };

  // Filter camps
  const filteredCamps = camps.filter((camp) => {
    // Search filter
    if (
      searchQuery &&
      !camp.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    // Date filters
    if (startDateFilter && camp.startDate < startDateFilter) {
      return false;
    }
    if (endDateFilter && camp.endDate > endDateFilter) {
      return false;
    }

    // Camp type filter
    if (
      selectedCampType !== "All" &&
      camp.campType?.name !== selectedCampType
    ) {
      return false;
    }

    // ✅ Changed: Empty array = show all statuses
    if (
      selectedStatuses.length > 0 &&
      !selectedStatuses.includes(camp.status)
    ) {
      return false;
    }

    return true;
  });

  // ✅ Changed: Handle "All" checkbox
  const handleAllStatusToggle = () => {
    setSelectedStatuses([]);
  };

  // Handle status checkbox
  const handleStatusToggle = (status: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  // ✅ Check if "All" is selected
  const isAllSelected = selectedStatuses.length === 0;

  // Sort filtered camps by start date
  const sortedCamps = [...filteredCamps].sort((a, b) => {
    const dateA = new Date(a.startDate).getTime();
    const dateB = new Date(b.startDate).getTime();
    return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
  });

  // Pagination
  const totalPages = Math.ceil(sortedCamps.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCamps = sortedCamps.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, startDateFilter, endDateFilter, selectedCampType, selectedStatuses]);

  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  // Status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case CampStatus.IN_PROGRESS:
        return "bg-blue-100 text-blue-700";
      case CampStatus.OPEN_FOR_REGISTRATION:
        return "bg-green-100 text-green-700";
      case CampStatus.COMPLETED:
        return "bg-gray-100 text-gray-700";
      case CampStatus.CANCELED:
        return "bg-red-100 text-red-700";
      case CampStatus.PENDING_APPOVAL:
        return "bg-yellow-100 text-yellow-700";
      case CampStatus.UNDER_ENROLLED:
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-6">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-[#111827]">Chương Trình Trại</h1>
        <p className="text-xs text-[#6B7280] mt-0.5">
          Quản lý và tổ chức các chương trình trại hè
        </p>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-6 mb-6">
        {/* Search and Date Filters */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-[#374151] mb-3">
            Tìm Kiếm & Khoảng Thời Gian
          </label>
          <div className="flex flex-wrap gap-3">
            {/* Search */}
            <div className="flex-1 min-w-[280px]">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Tìm theo tên trại..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-1.5 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent text-sm text-[#6B7280] placeholder:text-[#9CA3AF]"
                />
              </div>
            </div>

            {/* Start Date */}
            <div className="min-w-[180px]">
              <DatePicker
                value={startDateFilter ? dayjs(startDateFilter) : null}
                onChange={(date) =>
                  setStartDateFilter(date ? date.format("YYYY-MM-DD") : "")
                }
                format="YYYY-MM-DD"
                placeholder="Ngày bắt đầu"
                className="w-full antd-date-picker"
                style={{ width: "100%" }}
              />
            </div>

            {/* End Date */}
            <div className="min-w-[180px]">
              <DatePicker
                value={endDateFilter ? dayjs(endDateFilter) : null}
                onChange={(date) =>
                  setEndDateFilter(date ? date.format("YYYY-MM-DD") : "")
                }
                format="YYYY-MM-DD"
                placeholder="Ngày kết thúc"
                className="w-full antd-date-picker"
                style={{ width: "100%" }}
              />
            </div>
          </div>

          {/* CSS for DatePicker styling */}
          <style>{`
            .antd-date-picker .ant-input {
              height: 34px !important;
              padding: 4px 11px !important;
              border-color: #E5E7EB !important;
              border-radius: 8px !important;
              font-size: 14px !important;
            }
            .antd-date-picker .ant-input:focus {
              box-shadow: 0 0 0 2px #6366F1 !important;
              border-color: #6366F1 !important;
            }
            .antd-date-picker .ant-input::placeholder {
              color: #9CA3AF !important;
            }
          `}</style>
        </div>

        {/* Camp Type Filter */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-[#374151] mb-3">
            Loại Trại
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCampType("All")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedCampType === "All"
                  ? "bg-[#6366F1] text-white"
                  : "bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]"
                }`}
            >
              Tất Cả
            </button>
            {campTypes.map((type) => (
              <button
                key={type.campTypeId}
                onClick={() => setSelectedCampType(type.name)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedCampType === type.name
                    ? "bg-[#6366F1] text-white"
                    : "bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]"
                  }`}
              >
                {type.name}
              </button>
            ))}
          </div>
        </div>

        {/* Status Checkboxes with Counts */}
        <div>
          <label className="block text-sm font-semibold text-[#374151] mb-3">
            Trạng Thái
          </label>
          <div className="flex flex-wrap gap-4">
            {/* ✅ Added: "All" checkbox */}
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={handleAllStatusToggle}
                className="w-4 h-4 rounded border-[#D1D5DB] text-[#6366F1] focus:ring-[#6366F1] focus:ring-2 bg-white"
              />
              <span className="text-sm text-[#374151] group-hover:text-[#111827] font-medium">
                Tất Cả
              </span>
              <span className="text-xs font-semibold text-[#6366F1] bg-[#EFF6FF] px-2 py-0.5 rounded-full">
                {camps.length}
              </span>
            </label>

            {/* Individual status checkboxes */}
            {Object.values(CampStatus).map((status) => (
              <label
                key={status}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={selectedStatuses.includes(status)}
                  onChange={() => handleStatusToggle(status)}
                  className="w-4 h-4 rounded border-[#D1D5DB] text-[#6366F1] focus:ring-[#6366F1] focus:ring-2 bg-white"
                />
                <span className="text-sm text-[#374151] group-hover:text-[#111827]">
                  {status.replace(/([A-Z])/g, " $1").trim()}
                </span>
                <span className="text-xs font-semibold text-[#6366F1] bg-[#EFF6FF] px-2 py-0.5 rounded-full">
                  {statusCounts[status] || 0}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-6 pt-6 border-t border-[#E5E7EB]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div>
                <span className="text-sm text-[#6B7280]">Tổng Chương Trình: </span>
                <span className="text-lg font-bold text-[#111827]">
                  {camps.length}
                </span>
              </div>
              <div>
                <span className="text-sm text-[#6B7280]">
                  Chờ Duyệt:{" "}
                </span>
                <span className="text-lg font-bold text-[#3B82F6]">
                  {statusCounts[CampStatus.PENDING_APPOVAL] || 0}
                </span>
              </div>
              <div>
                <span className="text-sm text-[#6B7280]">Đang Diễn Ra: </span>
                <span className="text-lg font-bold text-[#3B82F6]">
                  {statusCounts[CampStatus.IN_PROGRESS] || 0}
                </span>
              </div>
              <div>
                <span className="text-sm text-[#6B7280]">Sắp Tới: </span>
                <span className="text-lg font-bold text-[#10B981]">
                  {statusCounts[CampStatus.OPEN_FOR_REGISTRATION] || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] overflow-hidden">
        {/* Table Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
          <div>
            <h2 className="text-lg font-bold text-[#111827]">
              Tìm Thấy: {filteredCamps.length}
            </h2>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#6366F1] text-white rounded-lg hover:bg-[#4F46E5] transition-all font-medium"
          >
            <HousePlus size={18} />
            Tạo chương trình mới
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider w-[100px]">
                  Mã Trại
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider w-[200px]">
                  Tên Trại
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider w-[130px]">
                  Loại Trại
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider w-[150px]">
                  Địa Điểm
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider w-[130px]">
                  <div className="flex items-center gap-1.5">
                    Ngày Bắt Đầu
                    <button
                      onClick={toggleSortOrder}
                      className="p-0.5 rounded hover:bg-[#E5E7EB] transition-colors"
                      title={`Sort ${sortOrder === "asc" ? "descending" : "ascending"}`}
                    >
                      <ArrowUpDown size={12} className="text-[#9CA3AF]" />
                    </button>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider w-[110px]">
                  Ngày Kết Thúc
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider w-[110px]">
                  Mở ĐK
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider w-[110px]">
                  Đóng ĐK
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider w-[130px]">
                  Giá
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider w-[140px]">
                  Trạng Thái
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-[#6B7280] uppercase tracking-wider w-[120px]">
                  Thao Tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {loading ? (
                <tr>
                  <td colSpan={11} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <Spin size="large" tip="Đang tải..." />
                    </div>
                  </td>
                </tr>
              ) : filteredCamps.length === 0 ? (
                <tr>
                  <td
                    colSpan={11}
                    className="px-6 py-12 text-center text-[#6B7280]"
                  >
                    Không tìm thấy trại phù hợp
                  </td>
                </tr>
              ) : (
                paginatedCamps.map((camp) => (
                  <tr
                    key={camp.campId}
                    className="hover:bg-[#F9FAFB] transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-mono text-[#6B7280]">
                      #{camp.campId}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-[#111827]">
                        {camp.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#EFF6FF] text-[#3B82F6]">
                        {camp.campType?.name || "Không có"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#6B7280]">
                      {camp.place}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#374151]">
                      {formatDate(camp.startDate)}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#374151]">
                      {formatDate(camp.endDate)}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#374151]">
                      {formatDate(camp.registrationStartDate)}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#374151]">
                      {formatDate(camp.registrationEndDate)}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-[#111827]">
                      {camp.price.toLocaleString("vi-VN")} VND
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          camp.status
                        )}`}
                      >
                        {camp.status.replace(/([A-Z])/g, " $1").trim()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => navigate(`/admin/camps/${camp.campId}`)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#6366F1] text-white rounded-lg hover:bg-[#4F46E5] transition-all font-medium text-sm"
                        title="Xem Chi Tiết"
                      >
                        <Eye size={16} />
                        Chi Tiết
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {filteredCamps.length > 0 && (
          <div className="px-6 py-4 border-t border-[#E5E7EB] flex items-center justify-between">
            <div className="text-sm text-[#6B7280]">
              Hiển thị {startIndex + 1} đến {Math.min(endIndex, sortedCamps.length)} trong {sortedCamps.length} kết quả
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${currentPage === 1
                    ? "bg-[#F3F4F6] text-[#9CA3AF] cursor-not-allowed"
                    : "bg-[#F3F4F6] text-[#374151] hover:bg-[#E5E7EB]"
                  }`}
              >
                Trước
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${currentPage === page
                            ? "bg-[#6366F1] text-white"
                            : "bg-[#F3F4F6] text-[#374151] hover:bg-[#E5E7EB]"
                          }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (
                    page === currentPage - 2 ||
                    page === currentPage + 2
                  ) {
                    return (
                      <span key={page} className="px-2 text-[#9CA3AF]">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${currentPage === totalPages
                    ? "bg-[#F3F4F6] text-[#9CA3AF] cursor-not-allowed"
                    : "bg-[#F3F4F6] text-[#374151] hover:bg-[#E5E7EB]"
                  }`}
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Camp Modal */}
      <CreateCampModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchData}
      />
    </div>
  );
};

export default CampPrograms;
