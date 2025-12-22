import React, { useEffect, useState } from 'react';
import { Spin, Modal } from 'antd';
import { Search, Eye, AlertTriangle } from 'lucide-react';
import { useNotification } from '../../../contexts/NotificationContext';
import reportService, { type ReportResponseDto } from '../../../services/reportService';

const AdminIncidents: React.FC = () => {
  const { toastError } = useNotification();
  const [reports, setReports] = useState<ReportResponseDto[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);

  // Counts
  const [typeCounts, setTypeCounts] = useState<Record<string, number>>({});
  const [levelCounts, setLevelCounts] = useState<Record<string, number>>({});

  // Detail Modal
  const [selectedReport, setSelectedReport] = useState<ReportResponseDto | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await reportService.getAllReports();
      // Sort by newest first
      const sortedData = data.sort((a, b) => {
        if (!a.createAt || !b.createAt) return 0;
        return new Date(b.createAt).getTime() - new Date(a.createAt).getTime();
      });
      setReports(sortedData);
      calculateCounts(sortedData);
    } catch (error) {
      console.error('[AdminIncidents] Failed to load reports:', error);
      toastError('Cảnh báo', 'Không thể tải báo cáo sự cố');
    } finally {
      setLoading(false);
    }
  };

  const calculateCounts = (data: ReportResponseDto[]) => {
    const types: Record<string, number> = {};
    const levels: Record<string, number> = {};
    
    data.forEach((report) => {
      if (report.reportType) {
        types[report.reportType] = (types[report.reportType] || 0) + 1;
      }
      if (report.level) {
        levels[report.level] = (levels[report.level] || 0) + 1;
      }
    });
    
    setTypeCounts(types);
    setLevelCounts(levels);
  };

  // Filter reports
  const filteredReports = reports.filter((report) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const camperName = report.camperName?.toLowerCase() || '';
      const reportId = report.reportId.toString();
      const reportedBy = report.reportedByName?.toLowerCase() || '';
      const campName = report.campName?.toLowerCase() || '';
      if (!camperName.includes(query) && !reportId.includes(query) && !reportedBy.includes(query) && !campName.includes(query)) {
        return false;
      }
    }

    // Type filter
    if (selectedTypes.length > 0 && report.reportType && !selectedTypes.includes(report.reportType)) {
      return false;
    }

    // Level filter
    if (selectedLevels.length > 0 && report.level && !selectedLevels.includes(report.level)) {
      return false;
    }

    return true;
  });

  // Handle type checkbox
  const handleTypeToggle = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleAllTypesToggle = () => {
    setSelectedTypes([]);
  };

  // Handle level checkbox
  const handleLevelToggle = (level: string) => {
    setSelectedLevels((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    );
  };

  const handleAllLevelsToggle = () => {
    setSelectedLevels([]);
  };

  const isAllTypesSelected = selectedTypes.length === 0;
  const isAllLevelsSelected = selectedLevels.length === 0;

  // Get level color
  const getLevelColor = (level?: string | null) => {
    if (!level) return 'bg-gray-100 text-gray-700';
    const levelLower = level.toLowerCase();
    if (levelLower.includes('low') || levelLower === '1') return 'bg-green-100 text-green-700';
    if (levelLower.includes('medium') || levelLower === '2') return 'bg-amber-100 text-amber-700';
    if (levelLower.includes('high') || levelLower === '3') return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-700';
  };

  const getTypeColor = (type?: string | null) => {
    if (!type) return 'bg-gray-100 text-gray-700';
    const typeLower = type.toLowerCase();
    if (typeLower.includes('transport')) return 'bg-blue-100 text-blue-700';
    if (typeLower.includes('checkout')) return 'bg-purple-100 text-purple-700';
    if (typeLower.includes('incident')) return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-700';
  };

  const getLevelText = (level?: string | null) => {
    if (!level) return 'N/A';
    const levelStr = level.toString();
    if (levelStr === '1') return 'Nhẹ';
    if (levelStr === '2') return 'Trung bình';
    if (levelStr === '3') return 'Nghiêm trọng';
    return level;
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const uniqueTypes = Object.keys(typeCounts);

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-6">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-[#111827]">Báo Cáo Sự Cố</h1>
        <p className="text-xs text-[#6B7280] mt-0.5">
          Quản lý và theo dõi tất cả các sự cố trong hệ thống
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-96">
          <Spin size="large" />
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-12 text-center">
          <p className="text-[#6B7280] text-lg">Không tìm thấy báo cáo sự cố</p>
        </div>
      ) : (
        <>
          {/* Filters and Table Section */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left Sidebar - Filters */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-6 sticky top-6">
                <h3 className="text-lg font-bold text-[#111827] mb-4">Bộ Lọc</h3>

                {/* Search */}
                <div className="mb-6">
                  <label className="block text-xs font-semibold text-[#374151] mb-2 uppercase tracking-wider">
                    Tìm Kiếm
                  </label>
                  <div className="relative">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
                      size={16}
                    />
                    <input
                      type="text"
                      placeholder="Theo tên hoặc mã..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent text-sm text-[#6B7280] placeholder:text-[#9CA3AF]"
                    />
                  </div>
                </div>

                {/* Type Filter */}
                {uniqueTypes.length > 0 && (
                  <div className="mb-6">
                    <label className="block text-xs font-semibold text-[#374151] mb-3 uppercase tracking-wider">
                      Loại Sự Cố
                    </label>
                    <div className="space-y-2">
                      {/* All checkbox */}
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={isAllTypesSelected}
                          onChange={handleAllTypesToggle}
                          className="w-4 h-4 rounded border-[#D1D5DB] text-[#6366F1] focus:ring-[#6366F1] focus:ring-2 bg-white"
                        />
                        <span className="text-sm text-[#374151] group-hover:text-[#111827] font-medium">
                          Tất Cả
                        </span>
                        <span className="text-xs font-semibold text-[#6366F1] bg-[#EFF6FF] px-2 py-0.5 rounded-full ml-auto">
                          {reports.length}
                        </span>
                      </label>

                      {/* Individual type checkboxes */}
                      {uniqueTypes.map((type) => (
                        <label
                          key={type}
                          className="flex items-center gap-2 cursor-pointer group"
                        >
                          <input
                            type="checkbox"
                            checked={selectedTypes.includes(type)}
                            onChange={() => handleTypeToggle(type)}
                            className="w-4 h-4 rounded border-[#D1D5DB] text-[#6366F1] focus:ring-[#6366F1] focus:ring-2 bg-white"
                          />
                          <span className="text-sm text-[#374151] group-hover:text-[#111827]">
                            {type}
                          </span>
                          <span className="text-xs font-semibold text-[#6366F1] bg-[#EFF6FF] px-2 py-0.5 rounded-full ml-auto">
                            {typeCounts[type] || 0}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Level Filter - Fixed */}
                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-3 uppercase tracking-wider">
                    Mức Độ
                  </label>
                  <div className="space-y-2">
                    {/* All checkbox */}
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={isAllLevelsSelected}
                        onChange={handleAllLevelsToggle}
                        className="w-4 h-4 rounded border-[#D1D5DB] text-[#6366F1] focus:ring-[#6366F1] focus:ring-2 bg-white"
                      />
                      <span className="text-sm text-[#374151] group-hover:text-[#111827] font-medium">
                        Tất Cả
                      </span>
                      <span className="text-xs font-semibold text-[#6366F1] bg-[#EFF6FF] px-2 py-0.5 rounded-full ml-auto">
                        {reports.length}
                      </span>
                    </label>

                    {/* Fixed level checkboxes */}
                    {['1', '2', '3'].map((level) => (
                      <label
                        key={level}
                        className="flex items-center gap-2 cursor-pointer group"
                      >
                        <input
                          type="checkbox"
                          checked={selectedLevels.includes(level)}
                          onChange={() => handleLevelToggle(level)}
                          className="w-4 h-4 rounded border-[#D1D5DB] text-[#6366F1] focus:ring-[#6366F1] focus:ring-2 bg-white"
                        />
                        <span className="text-sm text-[#374151] group-hover:text-[#111827]">
                          {getLevelText(level)}
                        </span>
                        <span className="text-xs font-semibold text-[#6366F1] bg-[#EFF6FF] px-2 py-0.5 rounded-full ml-auto">
                          {levelCounts[level] || 0}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Summary Stats */}
                <div className="mt-6 pt-6 border-t border-[#E5E7EB]">
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs text-[#6B7280]">Tổng: </span>
                      <span className="text-lg font-bold text-[#111827]">
                        {reports.length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Main Section - Table */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] overflow-hidden">
                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                          ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                          Trại Viên
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                          Trại
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                          Người Báo Cáo
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                          Loại
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                          Mức Độ
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                          Ngày Tạo
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                          Thao Tác
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E7EB]">
                      {filteredReports.length === 0 ? (
                        <tr>
                          <td
                            colSpan={8}
                            className="px-6 py-12 text-center text-[#6B7280]"
                          >
                            Không tìm thấy báo cáo phù hợp
                          </td>
                        </tr>
                      ) : (
                        filteredReports.map((report) => (
                          <tr
                            key={report.reportId}
                            className="hover:bg-[#F9FAFB] transition-colors"
                          >
                            <td className="px-6 py-4 text-sm font-mono text-[#6B7280]">
                              #{report.reportId}
                            </td>
                            <td className="px-6 py-4 text-sm text-[#374151]">
                              {report.camperName || 'N/A'}
                            </td>
                            <td className="px-6 py-4 text-sm text-[#374151]">
                              {report.campName || 'N/A'}
                            </td>
                            <td className="px-6 py-4 text-sm text-[#374151]">
                              {report.reportedByName || 'N/A'}
                            </td>
                            <td className="px-6 py-4">
                              {report.reportType && (
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(
                                    report.reportType
                                  )}`}
                                >
                                  {report.reportType}
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              {report.level && (
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLevelColor(
                                    report.level
                                  )}`}
                                >
                                  {getLevelText(report.level)}
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm text-[#374151]">
                              {formatDate(report.createAt)}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => {
                                  setSelectedReport(report);
                                  setIsModalVisible(true);
                                }}
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
              </div>
            </div>
          </div>
        </>
      )}

      {/* Detail Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-indigo-600" size={24} />
            <span className="text-xl font-bold">Chi Tiết Báo Cáo #{selectedReport?.reportId}</span>
          </div>
        }
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setSelectedReport(null);
        }}
        footer={null}
        width={800}
      >
        {selectedReport && (
          <div className="space-y-4 mt-4">
            {/* Tags */}
            <div className="flex gap-2 flex-wrap">
              {selectedReport.reportType && (
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(selectedReport.reportType)}`}>
                  {selectedReport.reportType}
                </span>
              )}
              {selectedReport.level && (
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getLevelColor(selectedReport.level)}`}>
                  Mức độ: {getLevelText(selectedReport.level)}
                </span>
              )}
              {selectedReport.status && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                  {selectedReport.status}
                </span>
              )}
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <p className="text-sm text-gray-500 mb-1">Trại viên</p>
                <p className="font-semibold text-gray-900">
                  {selectedReport.camperName || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Trại</p>
                <p className="font-semibold text-gray-900">
                  {selectedReport.campName || 'N/A'}
                </p>
              </div>
              {selectedReport.activityScheduleName && (
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500 mb-1">Hoạt động</p>
                  <p className="font-semibold text-gray-900">
                    {selectedReport.activityScheduleName}
                  </p>
                </div>
              )}
              {selectedReport.reportedByName && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Người báo cáo</p>
                  <p className="font-semibold text-gray-900">
                    {selectedReport.reportedByName}
                  </p>
                </div>
              )}
              {selectedReport.createAt && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Ngày tạo</p>
                  <p className="font-semibold text-gray-900">
                    {formatDate(selectedReport.createAt)}
                  </p>
                </div>
              )}
            </div>

            {/* Note */}
            {selectedReport.note && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-2 font-semibold">Ghi chú</p>
                <p className="text-gray-900 whitespace-pre-wrap">{selectedReport.note}</p>
              </div>
            )}

            {/* Image */}
            {selectedReport.image && (
              <div>
                <p className="text-sm text-gray-500 mb-2 font-semibold">Hình ảnh</p>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <img
                    src={selectedReport.image}
                    alt="Report evidence"
                    className="w-full h-auto max-h-96 object-contain bg-gray-100"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminIncidents;
