import React, { useState, useEffect } from 'react';
import { Modal, Spin } from 'antd';
import { FileText, Calendar, Users, Banknote, Tag, FileCheck, CheckCircle2 } from 'lucide-react';
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
      let errorMsg = 'Failed to load registration details';
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      }
      toastError('Error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      setApproving(true);
      await registrationService.approveRegistration(registrationId);
      toastSuccess('Success', 'Registration approved successfully');
      
      // Refresh data
      await fetchRegistrationDetails();
      
      // Notify parent component
      if (onApproved) {
        onApproved();
      }
    } catch (error: any) {
      console.error('Error approving registration:', error);
      let errorMsg = 'Failed to approve registration';
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      }
      toastError('Error', errorMsg);
    } finally {
      setApproving(false);
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
      case 'Completed':
        return 'bg-gray-100 text-gray-700';
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
              disabled={approving}
            >
              Close
            </button>
            <button
              onClick={handleApprove}
              disabled={approving}
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
    </Modal>
  );
};

export default RegistrationDetailModal;
