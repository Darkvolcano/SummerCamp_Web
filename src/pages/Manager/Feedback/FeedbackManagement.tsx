import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Button,
  Modal,
  Space,
  Tag,
  message,
  Input,
  Tooltip,
  Rate,
  Avatar,
  Empty
} from 'antd';
import {
  CloseOutlined,
  SendOutlined,
  WarningOutlined,
  UserOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { useManagerContext } from '../../../hooks/useManagerContext';
import feedbackService, {
  type FeedbackResponseDto
} from '../../../services/feedbackService';
import dayjs from 'dayjs';

const FeedbackManagement: React.FC = () => {
  const { selectedCampId } = useManagerContext();
  const [feedbacks, setFeedbacks] = useState<FeedbackResponseDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Reply Modal State
  const [replyModalVisible, setReplyModalVisible] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackResponseDto | null>(null);
  const [replyContent, setReplyContent] = useState('');

  // Reject Modal State
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // Detail Modal State
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  const fetchFeedbacks = useCallback(async () => {
    if (!selectedCampId) return;
    setLoading(true);
    try {
      const data = await feedbackService.getFeedbacksByCampId(selectedCampId);
      // Sort by createAt desc
      const sortedData = data.sort((a, b) => 
        new Date(b.createAt || '').getTime() - new Date(a.createAt || '').getTime()
      );
      setFeedbacks(sortedData);
    } catch (error: any) {
      console.error('Error fetching feedbacks:', error);
      message.error(error.response?.data?.message || 'Không thể tải danh sách đánh giá');
    } finally {
      setLoading(false);
    }
  }, [selectedCampId]);

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  const handleOpenReplyModal = (feedback: FeedbackResponseDto) => {
    setSelectedFeedback(feedback);
    setReplyContent(feedback.managerReply || '');
    setReplyModalVisible(true);
  };

  const handleOpenRejectModal = (feedback: FeedbackResponseDto) => {
    setSelectedFeedback(feedback);
    setRejectReason('');
    setRejectModalVisible(true);
  };

  const handleReplyFeedback = async () => {
    if (!selectedFeedback) return;
    
    if (!replyContent.trim()) {
      message.error('Vui lòng nhập nội dung phản hồi');
      return;
    }

    setActionLoading(true);
    try {
      await feedbackService.managerReplyFeedback(selectedFeedback.feedbackId, {
        reply: replyContent.trim()
      });
      
      message.success('Đã gửi phản hồi thành công');
      setReplyModalVisible(false);
      fetchFeedbacks();
    } catch (error: any) {
      console.error('Error replying feedback:', error);
      message.error(error.response?.data?.message || 'Không thể gửi phản hồi');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectFeedback = async () => {
    if (!selectedFeedback) return;
    
    if (!rejectReason.trim()) {
      message.error('Vui lòng nhập lý do từ chối');
      return;
    }

    setActionLoading(true);
    try {
      await feedbackService.rejectFeedback(selectedFeedback.feedbackId, {
        rejectionReason: rejectReason.trim()
      });
      
      message.success('Đã từ chối đánh giá');
      setRejectModalVisible(false);
      fetchFeedbacks();
    } catch (error: any) {
      console.error('Error rejecting feedback:', error);
      message.error(error.response?.data?.message || 'Không thể từ chối đánh giá');
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    {
      title: 'Người Dùng',
      key: 'user',
      render: (record: FeedbackResponseDto) => (
        <Space>
          <Avatar icon={<UserOutlined />} src={null} /> 
          <div className="flex flex-col">
            <span className="font-medium text-gray-900">{record.userName || 'Người dùng ẩn danh'}</span>
            <span className="text-xs text-gray-500">#{record.userId}</span>
          </div>
        </Space>
      ),
      width: 200,
    },
    {
      title: 'Đánh Giá',
      key: 'rating',
      render: (record: FeedbackResponseDto) => (
        <div>
          <Rate disabled defaultValue={record.rating || 0} className="text-sm" />
          <div className="text-xs text-gray-500 mt-1">
            {dayjs(record.createAt).format('DD/MM/YYYY HH:mm')}
          </div>
        </div>
      ),
      width: 180,
    },
    {
      title: 'Nội Dung',
      key: 'content',
      render: (record: FeedbackResponseDto) => (
        <div className="max-w-md">
          <p className="text-gray-800 whitespace-pre-wrap">{record.comment}</p>
          {record.managerReply && (
            <div className="mt-2 bg-blue-50 p-3 rounded-lg border border-blue-100">
              <p className="text-xs font-semibold text-blue-800 mb-1">Phản hồi của quản lý:</p>
              <p className="text-sm text-gray-700">{record.managerReply}</p>
              <p className="text-xs text-gray-400 mt-1 text-right">
                {record.replyAt ? dayjs(record.replyAt).format('DD/MM/YYYY HH:mm') : ''}
              </p>
            </div>
          )}
          {record.status === 'Rejected' && record.rejectionReason && (
            <div className="mt-2 bg-red-50 p-3 rounded-lg border border-red-100">
              <p className="text-xs font-semibold text-red-800 mb-1">Từ chối đánh giá:</p>
              <p className="text-sm text-gray-700">{record.rejectionReason}</p>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Trạng Thái',
      key: 'status',
      width: 150,
      render: (record: FeedbackResponseDto) => {
        let color = 'default';
        let text = 'Chờ xử lý';

        if (record.status === 'Rejected') {
          color = 'error';
          text = 'Đã từ chối';
        } else if (record.managerReply) {
          color = 'success';
          text = 'Đã phản hồi';
        } else {
            color = 'processing';
            text = 'Chưa phản hồi';
        }

        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: 'Hành Động',
      key: 'action',
      width: 150,
      render: (record: FeedbackResponseDto) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button 
              type="default" 
              icon={<EyeOutlined />} 
              size="small"
              onClick={() => {
                setSelectedFeedback(record);
                setDetailModalVisible(true);
              }}
            />
          </Tooltip>
          {record.status !== 'Rejected' && !record.managerReply && (
            <>
              <Tooltip title="Phản hồi">
                <Button 
                  type="primary" 
                  ghost 
                  icon={<SendOutlined />} 
                  size="small"
                  onClick={() => handleOpenReplyModal(record)}
                />
              </Tooltip>
              <Tooltip title="Từ chối hiển thị">
                <Button 
                  danger 
                  icon={<CloseOutlined />} 
                  size="small"
                  onClick={() => handleOpenRejectModal(record)}
                />
              </Tooltip>
            </>
          )}
        </Space>
      ),
    },
  ];

  if (!selectedCampId) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] p-6 flex items-center justify-center">
        <Empty description="Vui lòng chọn một trại để xem đánh giá" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#111827]">Quản Lý Đánh Giá</h1>
        <p className="text-xs text-[#6B7280] mt-0.5">
          Xem và phản hồi đánh giá từ phụ huynh
        </p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table
          columns={columns}
          dataSource={feedbacks}
          loading={loading}
          rowKey="feedbackId"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} đánh giá`,
            pageSizeOptions: ['10', '20', '50'],
            locale: { items_per_page: '/ trang' }
          }}
        />
      </div>

      {/* Reply Modal */}
      <Modal
        title="Phản Hồi Đánh Giá"
        open={replyModalVisible}
        onCancel={() => setReplyModalVisible(false)}
        footer={null}
        width={500}
      >
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex justify-between items-start mb-2">
              <span className="font-semibold text-gray-900">{selectedFeedback?.userName}</span>
              <Rate disabled value={selectedFeedback?.rating || 0} className="text-xs" />
            </div>
            <p className="text-sm text-gray-700">{selectedFeedback?.comment}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Nội dung phản hồi <span className="text-red-500">*</span>
            </label>
            <Input.TextArea
              placeholder="Nhập nội dung phản hồi..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              rows={4}
              showCount
              maxLength={500}
              autoFocus
            />
          </div>

          <Space className="w-full justify-end">
            <Button onClick={() => setReplyModalVisible(false)}>
              Hủy
            </Button>
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleReplyFeedback}
              loading={actionLoading}
            >
              Gửi Phản Hồi
            </Button>
          </Space>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal
        title="Chi tiết đánh giá"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedFeedback && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold text-gray-900">{selectedFeedback.userName || 'Người dùng ẩn danh'}</p>
                  <p className="text-xs text-gray-500">ID: #{selectedFeedback.userId}</p>
                </div>
                <Rate disabled value={selectedFeedback.rating || 0} />
              </div>
              <div className="border-t pt-3">
                <p className="text-sm font-medium text-gray-700 mb-1">Nội dung đánh giá:</p>
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedFeedback.comment}</p>
              </div>
              <div className="border-t pt-3 mt-3">
                <p className="text-xs text-gray-500">
                  Ngày tạo: {dayjs(selectedFeedback.createAt).format('DD/MM/YYYY HH:mm')}
                </p>
              </div>
            </div>

            {selectedFeedback.managerReply && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <p className="text-sm font-semibold text-blue-800 mb-2">Phản hồi của quản lý:</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedFeedback.managerReply}</p>
                {selectedFeedback.replyAt && (
                  <p className="text-xs text-gray-500 mt-2">
                    Ngày phản hồi: {dayjs(selectedFeedback.replyAt).format('DD/MM/YYYY HH:mm')}
                  </p>
                )}
              </div>
            )}

            {selectedFeedback.status === 'Rejected' && selectedFeedback.rejectionReason && (
              <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                <p className="text-sm font-semibold text-red-800 mb-2">Từ chối đánh giá:</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedFeedback.rejectionReason}</p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button onClick={() => setDetailModalVisible(false)}>Đóng</Button>
              {selectedFeedback.status !== 'Rejected' && !selectedFeedback.managerReply && (
                <>
                  <Button 
                    type="primary" 
                    ghost
                    icon={<SendOutlined />}
                    onClick={() => {
                      setDetailModalVisible(false);
                      handleOpenReplyModal(selectedFeedback);
                    }}
                  >
                    Phản hồi
                  </Button>
                  <Button 
                    danger
                    icon={<CloseOutlined />}
                    onClick={() => {
                      setDetailModalVisible(false);
                      handleOpenRejectModal(selectedFeedback);
                    }}
                  >
                    Từ chối
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal
        title="Từ Chối Hiển Thị Đánh Giá"
        open={rejectModalVisible}
        onCancel={() => setRejectModalVisible(false)}
        footer={null}
        width={500}
      >
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <WarningOutlined className="text-red-600 text-xl mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900 mb-1">
                  Ẩn đánh giá này khỏi trang công khai?
                </p>
                <p className="text-sm text-gray-600">
                  Hành động này sẽ ẩn đánh giá của phụ huynh. Vui lòng cung cấp lý do.
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Lý do từ chối <span className="text-red-500">*</span>
            </label>
            <Input.TextArea
              placeholder="Ví dụ: Nội dung không phù hợp, ngôn từ thù địch..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              showCount
              maxLength={500}
              autoFocus
            />
          </div>

          <Space className="w-full justify-end">
            <Button onClick={() => setRejectModalVisible(false)}>
              Hủy
            </Button>
            <Button
              danger
              type="primary"
              icon={<CloseOutlined />}
              onClick={handleRejectFeedback}
              loading={actionLoading}
            >
              Xác Nhận Ẩn
            </Button>
          </Space>
        </div>
      </Modal>
    </div>
  );
};

export default FeedbackManagement;
