import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Table, Button, Tag, message, Input, Upload } from 'antd';
import { EyeOutlined, CheckOutlined, CloseOutlined, UploadOutlined } from '@ant-design/icons';
import { useManagerContext } from '../../../hooks/useManagerContext';
import refundService, { type RegistrationCancelResponseDto } from '../../../services/refundService';
import type { ColumnsType } from 'antd/es/table';
import type { UploadFile } from 'antd/es/upload/interface';

const RefundManagement: React.FC = () => {
  const { selectedCampId } = useManagerContext();
  const [refunds, setRefunds] = useState<RegistrationCancelResponseDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [selectedRefund, setSelectedRefund] = useState<RegistrationCancelResponseDto | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [transactionCode, setTransactionCode] = useState('');
  const [managerNote, setManagerNote] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [refundImage, setRefundImage] = useState<UploadFile | null>(null);

  const fetchRefunds = useCallback(async () => {
    if (!selectedCampId) return;
    setLoading(true);
    try {
      const data = await refundService.getCampRefundRequests(selectedCampId);
      setRefunds(data);
    } catch (error: any) {
      console.error('Error fetching refunds:', error);
      message.error(error.response?.data?.message || 'Không thể tải danh sách yêu cầu hoàn tiền');
    } finally {
      setLoading(false);
    }
  }, [selectedCampId]);

  useEffect(() => {
    fetchRefunds();
  }, [fetchRefunds]);

  const handleViewDetail = (refund: RegistrationCancelResponseDto) => {
    setSelectedRefund(refund);
    setTransactionCode('');
    setManagerNote('');
    setRefundImage(null);
    setDetailModalVisible(true);
  };

  const handleOpenRejectModal = () => {
    setRejectReason('');
    setRejectModalVisible(true);
  };

  const handleApproveRefund = async () => {
    if (!selectedRefund) return;

    if (!transactionCode.trim()) {
      message.error('Vui lòng nhập mã giao dịch');
      return;
    }

    if (!refundImage) {
      message.error('Vui lòng tải lên hình ảnh xác nhận');
      return;
    }

    setActionLoading(true);
    try {
      await refundService.approveRefund({
        registrationCancelId: selectedRefund.registrationCancelId,
        transactionCode: transactionCode.trim(),
        refundImage: refundImage.originFileObj as File,
        managerNote: managerNote.trim() || undefined,
      });

      message.success('Đã phê duyệt yêu cầu hoàn tiền');
      setDetailModalVisible(false);
      fetchRefunds();
    } catch (error: any) {
      console.error('Error approving refund:', error);
      message.error(error.response?.data?.message || 'Không thể phê duyệt yêu cầu hoàn tiền');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectRefund = async () => {
    if (!selectedRefund) return;

    if (!rejectReason.trim()) {
      message.error('Vui lòng nhập lý do từ chối');
      return;
    }

    setActionLoading(true);
    try {
      await refundService.rejectRefund({
        registrationCancelId: selectedRefund.registrationCancelId,
        rejectReason: rejectReason.trim(),
      });

      message.success('Đã từ chối yêu cầu hoàn tiền');
      setRejectModalVisible(false);
      setDetailModalVisible(false);
      fetchRefunds();
    } catch (error: any) {
      console.error('Error rejecting refund:', error);
      message.error(error.response?.data?.message || 'Không thể từ chối yêu cầu hoàn tiền');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusTag = (status: string) => {
    const statusMap: { [key: string]: { color: string; text: string } } = {
      Pending: { color: 'processing', text: 'Chờ xử lý' },
      Approved: { color: 'success', text: 'Đã phê duyệt' },
      Rejected: { color: 'error', text: 'Đã từ chối' },
      Completed: { color: 'success', text: 'Hoàn thành' },
    };
    const statusInfo = statusMap[status] || { color: 'default', text: status };
    return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
  };

  const columns: ColumnsType<RegistrationCancelResponseDto> = [
    {
      title: 'Mã yêu cầu',
      dataIndex: 'registrationCancelId',
      key: 'registrationCancelId',
      width: 120,
    },
    {
      title: 'Phụ huynh',
      key: 'parent',
      render: (record: RegistrationCancelResponseDto) => (
        <div>
          <div className="font-medium">{record.parentName}</div>
          <div className="text-xs text-gray-500">{record.parentEmail}</div>
        </div>
      ),
      width: 200,
    },
    {
      title: 'Trẻ tham gia',
      dataIndex: 'camperNames',
      key: 'camperNames',
      render: (names: string[]) => (
        <div className="space-y-1">
          {names.map((name, idx) => (
            <div key={idx} className="text-sm">{name}</div>
          ))}
        </div>
      ),
      width: 180,
    },
    {
      title: 'Số tiền hoàn',
      dataIndex: 'refundAmount',
      key: 'refundAmount',
      render: (amount: number) => (
        <span className="font-semibold text-green-600">
          {amount.toLocaleString('vi-VN')} ₫
        </span>
      ),
      width: 150,
    },
    {
      title: 'Ngân hàng',
      key: 'bank',
      render: (record: RegistrationCancelResponseDto) => (
        <div className="text-sm">
          <div className="font-medium">{record.bankName}</div>
          <div className="text-gray-600">{record.bankNumber}</div>
          <div className="text-gray-500">{record.bankAccountName}</div>
        </div>
      ),
      width: 200,
    },
    {
      title: 'Ngày yêu cầu',
      dataIndex: 'requestDate',
      key: 'requestDate',
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
      width: 120,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
      width: 130,
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (record: RegistrationCancelResponseDto) => (
        <Button
          type="primary"
          ghost
          icon={<EyeOutlined />}
          onClick={() => handleViewDetail(record)}
        >
          Chi tiết
        </Button>
      ),
      width: 120,
      fixed: 'right',
    },
  ];

  if (!selectedCampId) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg">Vui lòng chọn một trại để xem yêu cầu hoàn tiền</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#111827]">Quản Lý Hoàn Tiền</h1>
        <p className="text-xs text-[#6B7280] mt-0.5">
          Xem và xử lý các yêu cầu hoàn tiền từ phụ huynh
        </p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table
          columns={columns}
          dataSource={refunds}
          loading={loading}
          rowKey="registrationCancelId"
          scroll={{ x: 1200 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} yêu cầu`,
            pageSizeOptions: ['10', '20', '50', '100'],
            locale: {
              items_per_page: '/ trang',
              jump_to: 'Đến trang',
              jump_to_confirm: 'xác nhận',
              page: '',
              prev_page: 'Trang trước',
              next_page: 'Trang sau',
              prev_5: '5 trang trước',
              next_5: '5 trang sau',
              prev_3: '3 trang trước',
              next_3: '3 trang sau',
            },
          }}
        />
      </div>

      {/* Detail Modal */}
      <Modal
        title={`Chi tiết yêu cầu hoàn tiền #${selectedRefund?.registrationCancelId}`}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={700}
      >
        {selectedRefund && (
          <div className="space-y-6">
            {/* Thông tin phụ huynh */}
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-3 border-b pb-2">
                Thông tin phụ huynh
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Họ tên</p>
                  <p className="text-base font-medium text-gray-900">{selectedRefund.parentName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Email</p>
                  <p className="text-base font-medium text-gray-900">{selectedRefund.parentEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Số điện thoại</p>
                  <p className="text-base font-medium text-gray-900">{selectedRefund.parentPhone}</p>
                </div>
              </div>
            </div>

            {/* Thông tin trẻ */}
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-3 border-b pb-2">
                Trẻ tham gia
              </h3>
              <div className="space-y-2">
                {selectedRefund.camperNames.map((name, idx) => (
                  <div key={idx} className="bg-gray-50 px-3 py-2 rounded">
                    <p className="text-sm font-medium text-gray-900">{name}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Thông tin hoàn tiền */}
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-3 border-b pb-2">
                Thông tin hoàn tiền
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Số tiền hoàn</p>
                  <p className="text-lg font-bold text-green-600">
                    {selectedRefund.refundAmount.toLocaleString('vi-VN')} ₫
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Ngày yêu cầu</p>
                  <p className="text-base font-medium text-gray-900">
                    {new Date(selectedRefund.requestDate).toLocaleString('vi-VN')}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-600 mb-1">Ngân hàng</p>
                  <div className="bg-blue-50 p-3 rounded border border-blue-100">
                    <p className="text-sm font-semibold text-gray-900">{selectedRefund.bankName}</p>
                    <p className="text-sm text-gray-700">STK: {selectedRefund.bankNumber}</p>
                    <p className="text-sm text-gray-700">Chủ TK: {selectedRefund.bankAccountName}</p>
                  </div>
                </div>
                {selectedRefund.reason && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600 mb-1">Lý do hủy</p>
                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded">{selectedRefund.reason}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Hiển thị thông tin phê duyệt/từ chối nếu đã xử lý */}
            {(selectedRefund.status === 'Approved' || selectedRefund.status === 'Completed') && (
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-3 border-b pb-2">
                  Thông tin phê duyệt
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Ngày phê duyệt</p>
                    <p className="text-base font-medium text-gray-900">
                      {selectedRefund.approvalDate
                        ? new Date(selectedRefund.approvalDate).toLocaleString('vi-VN')
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Mã giao dịch</p>
                    <p className="text-base font-medium text-gray-900">{selectedRefund.transactionCode || 'N/A'}</p>
                  </div>
                  {selectedRefund.managerNote && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600 mb-1">Ghi chú</p>
                      <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded">{selectedRefund.managerNote}</p>
                    </div>
                  )}
                  {selectedRefund.imageRefund && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600 mb-2">Hình ảnh xác nhận</p>
                      <img
                        src={selectedRefund.imageRefund}
                        alt="Refund confirmation"
                        className="max-w-full h-auto rounded border"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {selectedRefund.status === 'Rejected' && selectedRefund.managerNote && (
              <div>
                <h3 className="text-base font-semibold text-red-900 mb-3 border-b border-red-200 pb-2">
                  Lý do từ chối
                </h3>
                <p className="text-sm text-red-800 bg-red-50 p-3 rounded border border-red-100">
                  {selectedRefund.managerNote}
                </p>
              </div>
            )}

            {/* Form phê duyệt/từ chối nếu đang Pending */}
            {selectedRefund.status === 'Pending' && (
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-3 border-b pb-2">
                  Xử lý yêu cầu
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Mã giao dịch <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="Nhập mã giao dịch chuyển khoản"
                      value={transactionCode}
                      onChange={(e) => setTransactionCode(e.target.value)}
                      size="large"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Ghi chú của quản lý
                    </label>
                    <Input.TextArea
                      placeholder="Thêm ghi chú (tùy chọn)"
                      value={managerNote}
                      onChange={(e) => setManagerNote(e.target.value)}
                      rows={3}
                      showCount
                      maxLength={500}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Hình ảnh xác nhận <span className="text-red-500">*</span>
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                      Tải lên ảnh chụp màn hình hoặc biên lai chuyển khoản
                    </p>
                    <Upload
                      listType="picture-card"
                      maxCount={1}
                      beforeUpload={() => false}
                      onChange={(info) => {
                        if (info.fileList.length > 0) {
                          setRefundImage(info.fileList[0]);
                        } else {
                          setRefundImage(null);
                        }
                      }}
                    >
                      {!refundImage && (
                        <div>
                          <UploadOutlined />
                          <div style={{ marginTop: 8 }}>Tải lên</div>
                        </div>
                      )}
                    </Upload>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button
                      danger
                      icon={<CloseOutlined />}
                      onClick={handleOpenRejectModal}
                      size="large"
                    >
                      Từ Chối
                    </Button>
                    <Button
                      type="primary"
                      icon={<CheckOutlined />}
                      onClick={handleApproveRefund}
                      loading={actionLoading}
                      size="large"
                    >
                      Phê Duyệt
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal
        title="Từ chối yêu cầu hoàn tiền"
        open={rejectModalVisible}
        onCancel={() => setRejectModalVisible(false)}
        footer={null}
        width={500}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Lý do từ chối <span className="text-red-500">*</span>
            </label>
            <Input.TextArea
              placeholder="Ví dụ: Thông tin tài khoản không chính xác, không đủ điều kiện hoàn tiền..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              showCount
              maxLength={500}
              autoFocus
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button onClick={() => setRejectModalVisible(false)} size="large">
              Hủy
            </Button>
            <Button
              danger
              type="primary"
              icon={<CloseOutlined />}
              onClick={handleRejectRefund}
              loading={actionLoading}
              size="large"
            >
              Xác Nhận Từ Chối
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RefundManagement;
