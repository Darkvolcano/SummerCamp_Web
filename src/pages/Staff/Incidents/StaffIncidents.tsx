import React, { useState, useEffect } from 'react';
import { Spin, Empty, Modal, Tag } from 'antd';
import { AlertTriangle } from 'lucide-react';
import reportService, { type ReportResponseDto } from '../../../services/reportService';
import { useNotification } from '../../../contexts/NotificationContext';

const StaffIncidents: React.FC = () => {
  const { toastError } = useNotification();

  const [reports, setReports] = useState<ReportResponseDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportResponseDto | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    fetchMyReports();
  }, []);

  const fetchMyReports = async () => {
    try {
      setLoading(true);
      const data = await reportService.getMyReports();
      setReports(data);
    } catch (error: any) {
      console.error('Failed to load reports:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.title || 'Không thể tải báo cáo';
      toastError('Cảnh báo', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (report: ReportResponseDto) => {
    setSelectedReport(report);
    setIsModalVisible(true);
  };

  const getLevelColor = (level?: string | null) => {
    if (!level) return 'default';
    const levelLower = level.toLowerCase();
    if (levelLower.includes('low') || levelLower === '1') return 'green';
    if (levelLower.includes('medium') || levelLower === '2') return 'orange';
    if (levelLower.includes('high') || levelLower === '3') return 'red';
    return 'default';
  };

  const getTypeColor = (type?: string | null) => {
    if (!type) return 'default';
    const typeLower = type.toLowerCase();
    if (typeLower.includes('transport')) return 'blue';
    if (typeLower.includes('checkout')) return 'purple';
    if (typeLower.includes('incident')) return 'red';
    return 'default';
  };

  const getLevelText = (level?: string | null) => {
    if (!level) return 'N/A';
    const levelStr = level.toString();
    if (levelStr === '1') return 'Nhẹ';
    if (levelStr === '2') return 'Trung bình';
    if (levelStr === '3') return 'Nghiêm trọng';
    return level;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spin size="large" tip="Đang tải báo cáo..." />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#111827]">
          Báo Cáo Sự Cố Của Tôi
        </h1>
        <p className="text-[#6B7280] text-sm mt-1">
          Danh sách các báo cáo sự cố mà bạn đã tạo
        </p>
      </div>

      {/* Reports List */}
      {reports.length === 0 ? (
        <div className="bg-white rounded-lg p-6 border border-[#E5E7EB] shadow-sm">
          <Empty description="Chưa có báo cáo sự cố nào" />
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report.reportId}
              onClick={() => handleViewDetail(report)}
              className="bg-white rounded-lg p-5 border border-[#E5E7EB] hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      #{report.reportId}
                    </h3>
                    {report.reportType && (
                      <Tag color={getTypeColor(report.reportType)}>
                        {report.reportType}
                      </Tag>
                    )}
                    {report.level && (
                      <Tag color={getLevelColor(report.level)}>
                        Mức độ: {report.level}
                      </Tag>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-8 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Trại viên:</span>
                      <span className="ml-2">
                        {report.camperName || `ID: ${report.camperId}`}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Trại:</span>
                      <span className="ml-2">
                        {report.campName || `ID: ${report.campId}`}
                      </span>
                    </div>
                    {report.createAt && (
                      <div>
                        <span className="font-medium">Ngày tạo:</span>
                        <span className="ml-2">
                          {new Date(report.createAt).toLocaleString('vi-VN')}
                        </span>
                      </div>
                    )}
                    {report.status && (
                      <div>
                        <span className="font-medium">Trạng thái:</span>
                        <span className="ml-2">
                          {report.status}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="ml-4 flex-shrink-0 self-center">
                  <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium shadow-sm">
                    Xem chi tiết
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-blue-600" size={24} />
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
              {selectedReport.reportType && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Loại sự cố</p>
                  <p className="font-semibold text-gray-900">
                    {selectedReport.reportType}
                  </p>
                </div>
              )}
              {selectedReport.level && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Mức độ</p>
                  <p className="font-semibold text-gray-900">
                    {getLevelText(selectedReport.level)}
                  </p>
                </div>
              )}
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
                    {new Date(selectedReport.createAt).toLocaleString('vi-VN')}
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

export default StaffIncidents;
