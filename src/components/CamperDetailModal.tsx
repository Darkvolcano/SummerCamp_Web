import React, { useState, useEffect } from 'react';
import { Modal, Spin, Tabs } from 'antd';
import { User, Calendar, Heart, Users, Tent, MapPin, Mail, Phone, UserCircle } from 'lucide-react';
import camperService, {
  type CamperResponseDto,
  type Guardian,
} from '../services/camperService';
import registrationCamperService, {
  type RegistrationCamperResponseDto,
} from '../services/registrationCamperService';
import { useNotification } from '../contexts/NotificationContext';

interface CamperDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  camperId: number;
  campId?: number;
}

const CamperDetailModal: React.FC<CamperDetailModalProps> = ({
  isOpen,
  onClose,
  camperId,
  campId,
}) => {
  const { toastError } = useNotification();
  const [loading, setLoading] = useState(false);
  const [camperData, setCamperData] = useState<CamperResponseDto | null>(null);
  const [campRegistration, setCampRegistration] = useState<RegistrationCamperResponseDto | null>(null);
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    if (isOpen && camperId) {
      fetchCamperDetails();
    }
  }, [isOpen, camperId, campId]);

  const fetchCamperDetails = async () => {
    try {
      setLoading(true);

      const camper = await camperService.getCamperById(camperId);
      setCamperData(camper);

      // Fetch guardians
      try {
        const guardianData = await camperService.getCamperGuardians(camperId);
        if (guardianData && guardianData.length > 0) {
          setGuardians(guardianData[0].guardians || []);
        }
      } catch {
        console.log('No guardian data available for this camper');
      }

      if (campId) {
        try {
          const registrations = await registrationCamperService.getRegistrationCampers(
            camperId,
            campId
          );
          if (registrations && registrations.length > 0) {
            setCampRegistration(registrations[0]);
          }
        } catch {
          console.log('No camp registration data available for this camper');
        }
      }
    } catch (error: any) {
      console.error('Error fetching camper details:', error);
      let errorMsg = 'Failed to load camper details';
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      }
      toastError('Error', errorMsg);
    } finally {
      setLoading(false);
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

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleClose = () => {
    setCamperData(null);
    setCampRegistration(null);
    onClose();
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <User size={20} className="text-[#6366F1]" />
          <span className="text-lg font-bold text-[#111827]">Camper Details</span>
        </div>
      }
      open={isOpen}
      onCancel={handleClose}
      footer={null}
      width={700}
      centered
    >
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Spin size="large" tip="Loading camper details..." />
        </div>
      ) : camperData ? (
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'info',
              label: 'Information',
              children: (
                <div className="space-y-6 min-h-[500px] max-h-[500px] overflow-y-auto pr-2">
                  {/* Avatar and Basic Info */}
                  <div className="flex items-start gap-6 pb-6 border-b border-[#E5E7EB]">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {camperData.avatar ? (
                        <img
                          src={camperData.avatar}
                          alt={camperData.camperName}
                          className="w-24 h-24 rounded-full object-cover border-4 border-[#6366F1] shadow-lg"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#6366F1] to-[#4F46E5] flex items-center justify-center border-4 border-[#6366F1] shadow-lg">
                          <User size={40} className="text-white" />
                        </div>
                      )}
                    </div>

                    {/* Name and Basic Info */}
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-[#111827] mb-2">
                        {camperData.camperName}
                      </h2>
                      <div className="flex items-center gap-4 text-sm text-[#6B7280]">
                        <span>
                          <span className="font-medium">Gender:</span> {camperData.gender}
                        </span>
                        <span>
                          <span className="font-medium">Age:</span> {calculateAge(camperData.dob)} years
                        </span>
                      </div>
                      <div className="mt-2 text-sm text-[#6B7280]">
                        <span className="font-medium">Date of Birth:</span> {formatDate(camperData.dob)}
                      </div>
                    </div>
                  </div>

                  {/* Health Information */}
                  {camperData.healthRecord && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 pb-2 border-b-2 border-blue-600 inline-block">
                        Health Information
                      </h3>
                      <div className="space-y-3 mt-4">
                        {camperData.healthRecord.condition && (
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#EFF6FF] flex items-center justify-center flex-shrink-0">
                              <Heart size={18} className="text-[#3B82F6]" />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs text-[#6B7280] font-medium">Medical Condition</p>
                              <p className="text-sm text-[#111827] font-medium">
                                {camperData.healthRecord.condition}
                              </p>
                            </div>
                          </div>
                        )}

                        {camperData.healthRecord.isAllergy && (
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#FEF3C7] flex items-center justify-center flex-shrink-0">
                              <Heart size={18} className="text-[#F59E0B]" />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs text-[#6B7280] font-medium">Allergies</p>
                              <p className="text-sm text-[#111827] font-medium">
                                {camperData.healthRecord.allergies || 'Yes'}
                              </p>
                            </div>
                          </div>
                        )}

                        {camperData.healthRecord.note && (
                          <div className="bg-[#F9FAFB] rounded-lg p-4 border border-[#E5E7EB]">
                            <p className="text-xs text-[#6B7280] font-medium mb-1">Additional Notes</p>
                            <p className="text-sm text-[#374151]">{camperData.healthRecord.note}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Camp Registration Info */}
                  {campRegistration && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 pb-2 border-b-2 border-blue-600 inline-block">
                        Camp Registration
                      </h3>
                      <div className="space-y-3 mt-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[#EFF6FF] flex items-center justify-center flex-shrink-0">
                            <Tent size={18} className="text-[#3B82F6]" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-[#6B7280] font-medium">Camp Name</p>
                            <p className="text-sm text-[#111827] font-semibold">
                              {campRegistration.camp.name}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[#EFF6FF] flex items-center justify-center flex-shrink-0">
                            <Calendar size={18} className="text-[#3B82F6]" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-[#6B7280] font-medium">Camp Duration</p>
                            <p className="text-sm text-[#111827] font-medium">
                              {formatDate(campRegistration.camp.startDate)} -{' '}
                              {formatDate(campRegistration.camp.endDate)}
                            </p>
                          </div>
                        </div>

                        {campRegistration.camperGroup && (
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#EFF6FF] flex items-center justify-center flex-shrink-0">
                              <Users size={18} className="text-[#3B82F6]" />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs text-[#6B7280] font-medium">Assigned Group</p>
                              <p className="text-sm text-[#111827] font-medium">
                                {campRegistration.camperGroup.groupName.groupName}
                              </p>
                            </div>
                          </div>
                        )}

                        {campRegistration.requestTransport && (
                          <div className="bg-[#EFF6FF] rounded-lg p-4 border border-[#DBEAFE]">
                            <div className="flex items-center gap-2">
                              <MapPin size={18} className="text-[#3B82F6]" />
                              <p className="text-sm font-medium text-[#3B82F6]">
                                Transport Requested
                              </p>
                            </div>
                          </div>
                        )}

                        {campRegistration.status && (
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#EFF6FF] flex items-center justify-center flex-shrink-0">
                              <Calendar size={18} className="text-[#3B82F6]" />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs text-[#6B7280] font-medium">Registration Status</p>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                {campRegistration.status}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ),
            },
            {
              key: 'guardians',
              label: `Guardians (${guardians.length})`,
              children: (
                <div className="space-y-4 min-h-[500px] max-h-[500px] overflow-y-auto pr-2">
                  {guardians.length === 0 ? (
                    <div className="text-center py-12 text-[#6B7280]">
                      <UserCircle size={48} className="mx-auto mb-4 text-gray-400" />
                      <p>No guardian information available</p>
                    </div>
                  ) : (
                    guardians.map((guardian, index) => (
                      <div
                        key={guardian.guardianId}
                        className="bg-[#F9FAFB] rounded-lg p-4 border border-[#E5E7EB]"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#6366F1] to-[#4F46E5] flex items-center justify-center flex-shrink-0">
                            <UserCircle size={24} className="text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-[#111827] mb-1">
                              {index + 1}. {guardian.fullName}
                            </h4>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                                <span className="font-medium">Title:</span>
                                <span>{guardian.title}</span>
                                <span className="mx-1">•</span>
                                <span className="font-medium">Gender:</span>
                                <span>{guardian.gender}</span>
                              </div>

                              {guardian.email && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Mail size={16} className="text-[#6366F1]" />
                                  <span className="text-[#374151]">{guardian.email}</span>
                                </div>
                              )}

                              {guardian.phoneNumber && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Phone size={16} className="text-[#6366F1]" />
                                  <span className="text-[#374151]">{guardian.phoneNumber}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ),
            },
          ]}
        />
      ) : (
        <div className="text-center py-12 text-[#6B7280]">
          No camper data available
        </div>
      )}
    </Modal>
  );
};

export default CamperDetailModal;
