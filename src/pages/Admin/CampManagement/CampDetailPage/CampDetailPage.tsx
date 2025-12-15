import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Spin, Button, Popover, Modal, Input } from 'antd';
import { CheckCircle, XCircle, Ban } from 'lucide-react';
import CampDetailNavbar from './CampDetailNavbar';
import CampDetailOverview from './CampDetailOverview';
import CampDetailSchedule from './CampDetailSchedule';
import CampDetailStaffAssignment from './CampDetailStaffAssignment';
import CampDetailGroup from './CampDetailGroup';
import CampDetailAccommodation from './CampDetailAccommodation';
import CampDetailDashboard from './CampDetailDashboard';
import CampDetailTransportSchedule from './CampDetailTransportSchedule';
import campService from '../../../../services/campService';
import { useNotification } from '../../../../contexts/NotificationContext';
import { CampStatus } from '../../../../enums/camp-status.enum';

const CampDetailPage: React.FC = () => {
  const { campId } = useParams<{ campId: string }>();
  const navigate = useNavigate();
  const { toastSuccess, toastError } = useNotification();
  const [activeTab, setActiveTab] = useState('overview');
  const [campName, setCampName] = useState('Loading...');
  const [campStatus, setCampStatus] = useState('DRAFT');
  const [isLoading, setIsLoading] = useState(true);
  const [openApprovePopover, setOpenApprovePopover] = useState(false);
  const [openRejectPopover, setOpenRejectPopover] = useState(false);
  const [openCancelModal, setOpenCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);


  const numericCampId = parseInt(campId || '0', 10);

  const fetchCampName = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const camp = await campService.getCampById(numericCampId);
      setCampName(camp.name);
      setCampStatus(camp.status);
    } catch (error) {
      console.error('Error fetching camp:', error);
      setCampName('Camp Not Found');
    } finally {
      setIsLoading(false);
    }
  }, [numericCampId]);

  // Fetch camp name
  useEffect(() => {
    if (numericCampId > 0) {
      fetchCampName();
    }
  }, [numericCampId, fetchCampName]);

  const handleApprove = async () => {
    try {
      await campService.approveCamp(numericCampId);
      toastSuccess('Success', 'Camp approved and published successfully!');
      fetchCampName();
      setOpenApprovePopover(false);
    } catch (error: any) {
      let errorMsg = 'Failed to approve camp';
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      }
      toastError('Error', errorMsg);
    }
  };

  const handleReject = async () => {
    try {
      await campService.rejectCamp(numericCampId);
      toastSuccess('Success', 'Camp rejected successfully!');
      fetchCampName();
      setOpenRejectPopover(false);
    } catch (error: any) {
      let errorMsg = 'Failed to reject camp';
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      }
      toastError('Error', errorMsg);
    }
  };

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      toastError('Error', 'Please provide a cancellation reason');
      return;
    }

    try {
      setCancelLoading(true);
      await campService.cancelCamp(numericCampId, cancelReason);
      toastSuccess('Success', 'Camp cancelled successfully. Registrations marked for refund.');
      fetchCampName();
      setOpenCancelModal(false);
      setCancelReason('');
    } catch (error: any) {
      let errorMsg = 'Failed to cancel camp';
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      }
      toastError('Error', errorMsg);
    } finally {
      setCancelLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleUpdate = () => {
    fetchCampName();
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <CampDetailOverview
            key={campStatus}
            campId={numericCampId}
            onBack={handleBack}
            onUpdate={handleUpdate}
          />
        );
      case 'schedule':
        return <CampDetailSchedule campId={numericCampId} campStatus={campStatus} />;
      case 'staff':
        return <CampDetailStaffAssignment campId={numericCampId} />;
      case 'group':
        return <CampDetailGroup campId={numericCampId} campStatus={campStatus} />;
      case 'accommodation':
        return <CampDetailAccommodation campId={numericCampId} campStatus={campStatus} />;
      case 'dashboard':
        return <CampDetailDashboard campId={numericCampId} campStatus={campStatus} />;
      case 'transportation':
        return <CampDetailTransportSchedule campId={numericCampId} campStatus={campStatus} />;
      default:
        return <CampDetailOverview key={campStatus} campId={numericCampId} onBack={handleBack} />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spin size="large" tip="Loading camp..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-[#111827]">{campName}</h1>
            <p className="text-sm text-[#6B7280] mt-1">Manage camp details and information</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {campStatus === CampStatus.PENDING_APPOVAL && (
              <>
                <Popover
                  content={
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Approve this camp?</p>
                      <div className="flex gap-2">
                        <Button
                          size="small"
                          type="primary"
                          danger={false}
                          onClick={handleApprove}
                        >
                          Yes
                        </Button>
                        <Button
                          size="small"
                          onClick={() => setOpenApprovePopover(false)}
                        >
                          No
                        </Button>
                      </div>
                    </div>
                  }
                  title="Confirm Approval"
                  trigger="click"
                  open={openApprovePopover}
                  onOpenChange={setOpenApprovePopover}
                >
                  <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-medium">
                    <CheckCircle size={18} />
                    Approve & Publish
                  </button>
                </Popover>

                <Popover
                  content={
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Reject this camp?</p>
                      <div className="flex gap-2">
                        <Button
                          size="small"
                          danger
                          onClick={handleReject}
                        >
                          Yes
                        </Button>
                        <Button
                          size="small"
                          onClick={() => setOpenRejectPopover(false)}
                        >
                          No
                        </Button>
                      </div>
                    </div>
                  }
                  title="Confirm Rejection"
                  trigger="click"
                  open={openRejectPopover}
                  onOpenChange={setOpenRejectPopover}
                >
                  <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-medium">
                    <XCircle size={18} />
                    Reject
                  </button>
                </Popover>
              </>
            )}

            {(campStatus === CampStatus.DRAFT || 
              campStatus === CampStatus.PENDING_APPOVAL ||
              campStatus === CampStatus.REJECTED ||
              campStatus === CampStatus.PUBLISHED ||
              campStatus === CampStatus.OPEN_FOR_REGISTRATION || 
              campStatus === CampStatus.REGISTRATION_CLOSED ||
              campStatus === CampStatus.UNDER_ENROLLED) && (
              <button 
                onClick={() => setOpenCancelModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all font-medium"
              >
                <Ban size={18} />
                Cancel Camp
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <CampDetailNavbar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onBack={handleBack}
        />

        {/* Tab Content */}
        {renderTab()}

        {/* Cancel Camp Modal */}
        <Modal
          title="Cancel Camp"
          open={openCancelModal}
          onCancel={() => {
            setOpenCancelModal(false);
            setCancelReason('');
          }}
          footer={[
            <Button
              key="back"
              onClick={() => {
                setOpenCancelModal(false);
                setCancelReason('');
              }}
            >
              No, Keep Camp
            </Button>,
            <Button
              key="submit"
              type="primary"
              danger
              loading={cancelLoading}
              onClick={handleCancel}
            >
              Yes, Cancel Camp
            </Button>,
          ]}
        >
          <div className="space-y-4">
            <p className="text-gray-700">
              This will cancel the camp and mark all paid registrations for manual refund. This action cannot be undone.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cancellation Reason <span className="text-red-500">*</span>
              </label>
              <Input.TextArea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g., Insufficient registrations, Venue unavailable..."
                rows={4}
                maxLength={500}
              />
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default CampDetailPage;
