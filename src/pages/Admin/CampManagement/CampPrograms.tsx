import React, { useState, useEffect } from "react";
import { Search, Download, Eye } from "lucide-react";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import campService, {
  type CampResponseDto,
} from "../../../services/campService";
import campTypeService, {
  type CampTypeResponseDto,
} from "../../../services/campTypeService";
import { CampStatus } from "../../../enums/camp-status.enum";
import CampDetailModal from "./CampDetailModal";
import CreateCampModal from "./CreateCampModal";

const CampPrograms: React.FC = () => {
  const [camps, setCamps] = useState<CampResponseDto[]>([]);
  const [campTypes, setCampTypes] = useState<CampTypeResponseDto[]>([]);
  const [loading, setLoading] = useState(true);

  // Detail Modal
  const [selectedCamp, setSelectedCamp] = useState<CampResponseDto | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Create Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");
  const [selectedCampType, setSelectedCampType] = useState<string>("All");

  // ✅ Changed: Empty array means "All" selected by default
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

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
        <h1 className="text-2xl font-bold text-[#111827]">Camp Programs</h1>
        <p className="text-xs text-[#6B7280] mt-0.5">
          Manage and organize your summer camp programs
        </p>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-6 mb-6">
        {/* Search and Date Filters */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-[#374151] mb-3">
            Search & Date Range
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
                  placeholder="Search by camp name..."
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
                placeholder="Start date"
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
                placeholder="End date"
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
            Camp Type
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCampType("All")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedCampType === "All"
                  ? "bg-[#6366F1] text-white"
                  : "bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]"
              }`}
            >
              All
            </button>
            {campTypes.map((type) => (
              <button
                key={type.campTypeId}
                onClick={() => setSelectedCampType(type.name)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedCampType === type.name
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
            Status
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
                All
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
                <span className="text-sm text-[#6B7280]">Total Programs: </span>
                <span className="text-lg font-bold text-[#111827]">
                  {filteredCamps.length}
                </span>
              </div>
              <div>
                <span className="text-sm text-[#6B7280]">Pending Approval: </span>
                <span className="text-lg font-bold text-[#3B82F6]">
                  {statusCounts[CampStatus.PENDING_APPOVAL] || 0}
                </span>
              </div>
              <div>
                <span className="text-sm text-[#6B7280]">In Progress: </span>
                <span className="text-lg font-bold text-[#3B82F6]">
                  {statusCounts[CampStatus.IN_PROGRESS] || 0}
                </span>
              </div>
              <div>
                <span className="text-sm text-[#6B7280]">Upcoming: </span>
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
              Found: {filteredCamps.length}
            </h2>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#6366F1] text-white rounded-lg hover:bg-[#4F46E5] transition-all font-medium"
          >
            <Download size={18} />
            Create new program
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  Camp ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  Camp Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  Camp Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  Place
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  Start Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  End Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  Reg. Start
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  Reg. End
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {loading ? (
                <tr>
                  <td colSpan={11} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6366F1]"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredCamps.length === 0 ? (
                <tr>
                  <td
                    colSpan={11}
                    className="px-6 py-12 text-center text-[#6B7280]"
                  >
                    No camps found matching your filters
                  </td>
                </tr>
              ) : (
                filteredCamps.map((camp) => (
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
                        {camp.campType?.name || "N/A"}
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
                      {camp.price.toLocaleString('vi-VN')} VND
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
                        onClick={() => {
                          setSelectedCamp(camp);
                          setIsDetailModalOpen(true);
                        }}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#6366F1] text-white rounded-lg hover:bg-[#4F46E5] transition-all font-medium text-sm"
                        title="View Details"
                      >
                        <Eye size={16} />
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Camp Detail Modal */}
      <CampDetailModal
        camp={selectedCamp}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedCamp(null);
        }}
        onUpdate={fetchData}
      />

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
