import React, { useState, useEffect } from 'react';
import { Modal, Spin, Checkbox, Input, Popconfirm } from 'antd';
import { FileText, Calendar, Users, Banknote, Tag, FileCheck, CheckCircle2, XCircle } from 'lucide-react';
import registrationService, {
  type RegistrationResponseDto,
} from '../services/registrationService';
import { useNotification } from '../contexts/NotificationContext';
import CamperDetailModal from './CamperDetailModal';

interface RegistrationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  registrationId: number;
  onApproved?: () => void;
}

const RegistrationDetailModal: React.FC<RegistrationDetailModalProps> = ({
  isOpen,
  onClose,
  registrationId,
  onApproved,
}) => {
  const { toastError, toastSuccess } = useNotification();
  const [loading, setLoading] = useState(false);
  const [approving, setApproving] = useState(false);
  const [registrationData, setRegistrationData] = useState<RegistrationResponseDto | null>(null);

  // Camper Detail Modal
  const [camperDetailModalOpen, setCamperDetailModalOpen] = useState(false);
  const [selectedCamperId, setSelectedCamperId] = useState<number | null>(null);

  // Reject Modal
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedCamperIdsForReject, setSelectedCamperIdsForReject] = useState<number[]>([]);

  useEffect(() => {
    if (isOpen && registrationId) {
      fetchRegistrationDetails();
    }
  }, [isOpen, registrationId]);

  const fetchRegistrationDetails = async () => {
    try {
      setLoading(true);
      const data = await registrationService.getRegistrationById(registrationId);
      setRegistrationData(data);
    } catch (error: any) {
      console.error('Error fetching registration details:', error);
      let errorMsg = 'Không thể tải chi tiết đăng ký';
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      }
      toastError('Lỗi', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      setApproving(true);
      await registrationService.approveRegistration(registrationId);
      toastSuccess('Thành công', 'Duyệt đăng ký thành công');

      // Refresh data
      await fetchRegistrationDetails();

      // Notify parent component
      if (onApproved) {
        onApproved();
      }
    } catch (error: any) {
      console.error('Error approving registration:', error);
      let errorMsg = 'Không thể duyệt đăng ký';
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      }
      toastError('Lỗi', errorMsg);
    } finally {
      setApproving(false);
    }
  };

  const handleOpenRejectModal = () => {
    setRejectModalVisible(true);
    setRejectReason('');
    setSelectedCamperIdsForReject([]);
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toastError('Lỗi', 'Vui lòng cung cấp lý do từ chối');
      return;
    }

    try {
      setRejecting(true);

      const rejectData = {
        registrationId: registrationId,
        rejectReason: rejectReason,
        camperId: selectedCamperIdsForReject.length === 1 ? selectedCamperIdsForReject[0] : undefined,
      };

      await registrationService.rejectRegistration(rejectData);

      if (selectedCamperIdsForReject.length === 0) {
        toastSuccess('Thành công', 'Từ chối đăng ký thành công');
      } else if (selectedCamperIdsForReject.length === 1) {
        toastSuccess('Thành công', 'Từ chối trại viên thành công');
      } else {
        toastSuccess('Thành công', `Từ chối ${selectedCamperIdsForReject.length} trại viên thành công`);
      }

      setRejectModalVisible(false);

      // Refresh data
      await fetchRegistrationDetails();

      // Notify parent component
      if (onApproved) {
        onApproved();
      }
    } catch (error: any) {
      console.error('Error rejecting registration:', error);
      let errorMsg = 'Không thể từ chối đăng ký';
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      }
      toastError('Lỗi', errorMsg);
    } finally {
      setRejecting(false);
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PendingApproval':
        return 'bg-amber-100 text-amber-700';
      case 'Approved':
        return 'bg-green-100 text-green-700';
      case 'Rejected':
        return 'bg-red-100 text-red-700';
      case 'Confirmed':
        return 'bg-blue-100 text-blue-700';
      case 'OnGoing':
        return 'bg-indigo-100 text-indigo-700';
      case 'Canceled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const handleClose = () => {
    setRegistrationData(null);
    onClose();
  };

  const isPendingApproval = registrationData?.status === 'PendingApproval';

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <FileText size={20} className="text-[#6366F1]" />
          <span className="text-lg font-bold text-[#111827]">Registration Details</span>
        </div>
      }
      open={isOpen}
      onCancel={handleClose}
      footer={
        isPendingApproval ? (
          <div className="flex justify-end gap-2 pt-4 border-t border-[#E5E7EB]">
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-[#F3F4F6] text-[#6B7280] rounded-lg hover:bg-[#E5E7EB] transition-all font-medium text-sm"
              disabled={approving || rejecting}
            >
              Close
            </button>
            <button
              onClick={handleOpenRejectModal}
              disabled={approving || rejecting}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {rejecting ? (
                <>
                  <Spin size="small" />
                  Rejecting...
                </>
              ) : (
                <>
                  <XCircle size={16} />
                  Reject
                </>
              )}
            </button>
            <Popconfirm
              title="Approve Registration"
              description="Are you sure you want to approve this registration?"
              onConfirm={handleApprove}
              okText="Yes, Approve"
              cancelText="Cancel"
              okButtonProps={{
                className: "bg-[#6366F1] hover:bg-[#4F46E5]",
                loading: approving,
              }}
              disabled={approving || rejecting}
            >
              <button
                disabled={approving || rejecting}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#6366F1] text-white rounded-lg hover:bg-[#4F46E5] transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {approving ? (
                  <>
                    <Spin size="small" />
                    Approving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    Approve Registration
                  </>
                )}
              </button>
            </Popconfirm>
          </div>
        ) : null
      }
      width={800}
      centered
    >
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Spin size="large" tip="Loading registration details..." />
        </div>
      ) : registrationData ? (
        <div className="space-y-6">
          {/* Registration ID and Status */}
          <div className="flex items-center justify-between pb-6 border-b border-[#E5E7EB]">
            <div>
              <h2 className="text-2xl font-bold text-[#111827] mb-2">
                Registration #{registrationData.registrationId}
              </h2>
              <p className="text-sm text-[#6B7280]">
                Created on {formatDate(registrationData.registrationCreateAt)}
              </p>
            </div>
            <span
              className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(
                registrationData.status
              )}`}
            >
              {registrationData.status.replace(/([A-Z])/g, ' $1').trim()}
            </span>
          </div>

          {/* User Information */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 pb-2 border-b-2 border-blue-600 inline-block">
              Registration Created By
            </h3>
            <div className="space-y-3 mt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#EFF6FF] flex items-center justify-center flex-shrink-0">
                  <Users size={18} className="text-[#3B82F6]" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-[#6B7280] font-medium">Parent/Guardian</p>
                  <p className="text-sm text-[#111827] font-semibold">{registrationData.user.fullName}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Camp Information */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 pb-2 border-b-2 border-blue-600 inline-block">
              Camp Information
            </h3>
            <div className="space-y-3 mt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#EFF6FF] flex items-center justify-center flex-shrink-0">
                  <Calendar size={18} className="text-[#3B82F6]" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-[#6B7280] font-medium">Camp Name</p>
                  <p className="text-sm text-[#111827] font-semibold">{registrationData.camp.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#EFF6FF] flex items-center justify-center flex-shrink-0">
                  <Calendar size={18} className="text-[#3B82F6]" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-[#6B7280] font-medium">Start Date</p>
                  <p className="text-sm text-[#111827] font-medium">
                    {formatDate(registrationData.camp.startDate)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Campers Information */}
          {registrationData.campers && registrationData.campers.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 pb-2 border-b-2 border-blue-600 inline-block">
                Campers ({registrationData.campers.length})
              </h3>
              <div className="space-y-3 mt-4">
                {registrationData.campers.map((camper, index) => (
                  <div
                    key={camper.camperId}
                    onClick={() => {
                      setSelectedCamperId(camper.camperId);
                      setCamperDetailModalOpen(true);
                    }}
                    className="bg-[#F9FAFB] rounded-lg p-4 border border-[#E5E7EB] cursor-pointer hover:bg-[#F3F4F6] hover:border-[#6366F1] transition-all"
                  >
                    <div className="flex items-start gap-4">
                      {camper.avatar ? (
                        <img
                          src={camper.avatar}
                          alt={camper.camperName}
                          className="w-12 h-12 rounded-full object-cover border-2 border-[#6366F1]"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#6366F1] to-[#4F46E5] flex items-center justify-center border-2 border-[#6366F1]">
                          <Users size={20} className="text-white" />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-[#111827] mb-1">
                          {index + 1}. {camper.camperName}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-[#6B7280]">
                          <span>
                            <span className="font-medium">Gender:</span> {camper.gender}
                          </span>
                          <span>
                            <span className="font-medium">DOB:</span> {formatDate(camper.dob)}
                          </span>
                          {camper.requestTransport && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                              Transport Requested
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment Information */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 pb-2 border-b-2 border-blue-600 inline-block">
              Payment Information
            </h3>
            <div className="space-y-3 mt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#EFF6FF] flex items-center justify-center flex-shrink-0">
                  <Banknote size={18} className="text-[#3B82F6]" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-[#6B7280] font-medium">Final Price</p>
                  <p className="text-lg text-[#111827] font-bold">
                    {registrationData.finalPrice
                      ? `${registrationData.finalPrice.toLocaleString('vi-VN')} VND`
                      : 'N/A'}
                  </p>
                </div>
              </div>

              {registrationData.appliedPromotion && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#EFF6FF] flex items-center justify-center flex-shrink-0">
                    <Tag size={18} className="text-[#3B82F6]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-[#6B7280] font-medium">Applied Promotion</p>
                    <p className="text-sm text-[#111827] font-medium">
                      {registrationData.appliedPromotion.name} (
                      {registrationData.appliedPromotion.percent}% off)
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Note */}
          {registrationData.note && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 pb-2 border-b-2 border-blue-600 inline-block">
                Note
              </h3>
              <div className="mt-4 bg-[#F9FAFB] rounded-lg p-4 border border-[#E5E7EB]">
                <div className="flex items-start gap-3">
                  <FileCheck size={18} className="text-[#6B7280] flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-[#374151]">{registrationData.note}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 text-[#6B7280]">
          No registration data available
        </div>
      )}

      {/* Camper Detail Modal */}
      {selectedCamperId && (
        <CamperDetailModal
          isOpen={camperDetailModalOpen}
          onClose={() => {
            setCamperDetailModalOpen(false);
            setSelectedCamperId(null);
          }}
          camperId={selectedCamperId}
          campId={registrationData?.camp.campId}
        />
      )}

      {/* Reject Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <XCircle size={20} className="text-red-500" />
            <span className="text-lg font-bold text-[#111827]">Reject Registration</span>
          </div>
        }
        open={rejectModalVisible}
        onCancel={() => {
          setRejectModalVisible(false);
          setRejectReason('');
          setSelectedCamperIdsForReject([]);
        }}
        footer={
          <div className="flex justify-end gap-3 pt-4 border-t border-[#E5E7EB]">
            <button
              onClick={() => {
                setRejectModalVisible(false);
                setRejectReason('');
                setSelectedCamperIdsForReject([]);
              }}
              className="px-5 py-2.5 bg-[#F3F4F6] text-[#6B7280] rounded-lg hover:bg-[#E5E7EB] transition-all font-medium text-sm"
              disabled={rejecting}
            >
              Cancel
            </button>
            <button
              onClick={handleReject}
              disabled={rejecting || !rejectReason.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {rejecting ? (
                <>
                  <Spin size="small" />
                  Rejecting...
                </>
              ) : (
                <>
                  <XCircle size={16} />
                  Confirm Reject
                </>
              )}
            </button>
          </div>
        }
        width={600}
        centered
      >
        <div className="space-y-4 mt-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> If you don't select any campers, the entire registration will be rejected.
              If you select specific campers, only those campers will be rejected.
            </p>
          </div>

          {/* Camper Selection */}
          {registrationData?.campers && registrationData.campers.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">
                Select Campers to Reject (Optional)
              </h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {registrationData.campers.map((camper) => (
                  <div
                    key={camper.camperId}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                  >
                    <Checkbox
                      checked={selectedCamperIdsForReject.includes(camper.camperId)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCamperIdsForReject([...selectedCamperIdsForReject, camper.camperId]);
                        } else {
                          setSelectedCamperIdsForReject(
                            selectedCamperIdsForReject.filter((id) => id !== camper.camperId)
                          );
                        }
                      }}
                    />
                    {camper.avatar ? (
                      <img
                        src={camper.avatar}
                        alt={camper.camperName}
                        className="w-10 h-10 rounded-full object-cover border-2 border-gray-300"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center">
                        <Users size={18} className="text-white" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">{camper.camperName}</p>
                      <p className="text-xs text-gray-600">
                        {camper.gender} • {formatDate(camper.dob)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reject Reason */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">
              Reason for Rejection <span className="text-red-500">*</span>
            </h4>
            <Input.TextArea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Please provide a reason for rejecting this registration..."
              rows={6}
              maxLength={500}
              showCount
              className="resize-none"
              style={{ minHeight: '150px' }}
            />
          </div>
        </div>
      </Modal>
    </Modal>
  );
};

export default RegistrationDetailModal;
