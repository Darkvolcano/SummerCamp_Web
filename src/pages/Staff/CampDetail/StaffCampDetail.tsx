import React, { useState, useEffect, useContext } from 'react';
import { Modal, Spin, Tag } from 'antd';
import {
  Calendar,
  MapPin,
  Users,
  Home,
  User,
  Clock,

  Info,
} from 'lucide-react';
import { StaffContext } from '../../../contexts/StaffContext';
import { useNotification } from '../../../contexts/NotificationContext';
import campService, { type CampResponseDto } from '../../../services/campService';
import staffService, {
  type CampGroupResponseDto,
  type CampAccommodationResponseDto,
} from '../../../services/staffService';
import camperService, { type CamperCampResponseDto } from '../../../services/camperService';
import camperGroupService from '../../../services/camperGroupService';
import camperAccommodationService from '../../../services/camperAccommodationService';
import CamperDetailModal from '../../../components/CamperDetailModal';

const StaffCampDetail: React.FC = () => {
  const context = useContext(StaffContext);
  const { toastError } = useNotification();

  const selectedCampId = context?.selectedCampId;

  const [camp, setCamp] = useState<CampResponseDto | null>(null);
  const [group, setGroup] = useState<CampGroupResponseDto | null>(null);
  const [accommodation, setAccommodation] = useState<CampAccommodationResponseDto | null>(null);
  const [loading, setLoading] = useState(false);

  // Modal states
  const [showCampersModal, setShowCampersModal] = useState(false);
  const [showGroupCampersModal, setShowGroupCampersModal] = useState(false);
  const [showAccommodationCampersModal, setShowAccommodationCampersModal] = useState(false);

  const [allCampers, setAllCampers] = useState<CamperCampResponseDto[]>([]);
  const [groupCampers, setGroupCampers] = useState<CamperCampResponseDto[]>([]);
  const [accommodationCampers, setAccommodationCampers] = useState<CamperCampResponseDto[]>([]);
  const [loadingCampers, setLoadingCampers] = useState(false);

  // Camper Detail Modal
  const [camperDetailModalOpen, setCamperDetailModalOpen] = useState(false);
  const [selectedCamperId, setSelectedCamperId] = useState<number | null>(null);

  // Fetch camp details
  useEffect(() => {
    if (!selectedCampId) {
      setCamp(null);
      setGroup(null);
      setAccommodation(null);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const [campData, groupData, accommodationData] = await Promise.all([
          campService.getCampById(selectedCampId),
          staffService.getCampGroups(selectedCampId).catch(() => null),
          staffService.getCampAccommodations(selectedCampId).catch(() => null),
        ]);

        setCamp(campData);
        setGroup(groupData);
        setAccommodation(accommodationData);
      } catch (error: any) {
        console.error('Failed to load camp details:', error);
        const errorMessage = error.response?.data?.message || error.response?.data?.title || 'Không thể tải chi tiết trại';
        toastError('Cảnh báo', errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCampId, toastError]);

  // Fetch all campers in camp
  const handleViewAllCampers = async () => {
    if (!selectedCampId) return;

    try {
      setLoadingCampers(true);
      const campers = await camperService.getCampersByCampId(selectedCampId);
      setAllCampers(campers);
      setShowCampersModal(true);
    } catch (error: any) {
      console.error('Failed to load campers:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.title || 'Không thể tải danh sách trại viên';
      toastError('Cảnh báo', errorMessage);
    } finally {
      setLoadingCampers(false);
    }
  };

  // Fetch group campers
  const handleViewGroupCampers = async () => {
    if (!selectedCampId || !group) return;

    try {
      setLoadingCampers(true);
      // Call camperGroupService with groupId to get campers in this specific group
      const camperGroups = await camperGroupService.getCamperGroups({ groupId: group.groupId });
      
      // Transform CamperGroupResponseDto[] to CamperCampResponseDto[] for UI compatibility
      const transformedCampers: CamperCampResponseDto[] = camperGroups.map((cg) => ({
        camperId: cg.camperName.camperId,
        camperName: cg.camperName.camperName,
        gender: '', // Not provided by API, will be empty
        dob: '', // Not provided by API, will be empty
        camperRegistrationStatus: cg.status,
      }));
      
      setGroupCampers(transformedCampers);
      setShowGroupCampersModal(true);
    } catch (error: any) {
      console.error('Failed to load group campers:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.title || 'Không thể tải trại viên nhóm';
      toastError('Cảnh báo', errorMessage);
    } finally {
      setLoadingCampers(false);
    }
  };

  // Fetch accommodation campers
  const handleViewAccommodationCampers = async () => {
    if (!selectedCampId || !accommodation) return;

    try {
      setLoadingCampers(true);
      // Call camperAccommodationService with accommodationId
      const camperAccommodations = await camperAccommodationService.getCamperAccommodations({
        accommodationId: accommodation.accommodationId
      });
      
      // Transform CamperAccommodationResponseDto[] to CamperCampResponseDto[] for UI compatibility
      const transformedCampers: CamperCampResponseDto[] = camperAccommodations.map((ca) => ({
        camperId: ca.camperId,
        camperName: ca.camperName || 'N/A',
        gender: '', // Not provided by accommodation API
        dob: '', // Not provided by accommodation API
        camperRegistrationStatus: ca.status || '',
      }));
      
      setAccommodationCampers(transformedCampers);
      setShowAccommodationCampersModal(true);
    } catch (error: any) {
      console.error('Failed to load accommodation campers:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.title || 'Không thể tải trại viên chỗ ở';
      toastError('Cảnh báo', errorMessage);
    } finally {
      setLoadingCampers(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-GB');
  };

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString('en-GB');
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string }> = {
      Draft: { color: 'default' },
      PendingApproval: { color: 'orange' },
      Published: { color: 'blue' },
      OpenForRegistration: { color: 'green' },
      RegistrationClosed: { color: 'red' },
      InProgress: { color: 'cyan' },
      Completed: { color: 'purple' },
      Canceled: { color: 'red' },
      Rejected: { color: 'red' },
    };

    const config = statusConfig[status] || { color: 'default' };
    return <Tag color={config.color}>{status}</Tag>;
  };

  if (!selectedCampId) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[500px]">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-indigo-200 p-12 rounded-2xl text-center shadow-lg max-w-md">
          <h3 className="text-xl font-bold text-indigo-900 mb-2">
            Chọn Trại
          </h3>
          <p className="text-indigo-700 text-base leading-relaxed">
            Vui lòng chọn một chương trình trại từ menu bên trái để xem chi tiết
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spin size="large" />
      </div>
    );
  }

  if (!camp) {
    return (
      <div className="p-6 text-center text-gray-500">
        Không tìm thấy trại
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#111827]">Chi Tiết Trại</h1>
        <p className="text-[#6B7280] text-sm mt-1">
          Xem thông tin trại được phân công của bạn
        </p>
      </div>

      {/* Camp Info Card */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] overflow-hidden mb-6">
        <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-[#E5E7EB]">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#111827]">{camp.name}</h2>
            {getStatusBadge(camp.status)}
          </div>
        </div>

        <div className="p-6">
          {/* Camp Image */}
          {camp.image && (
            <div className="mb-6">
              <img
                src={camp.image}
                alt={camp.name}
                className="w-full h-96 object-cover rounded-lg"
              />
            </div>
          )}

          {/* Camp Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Info size={20} className="text-[#6366F1] mt-1" />
                <div>
                  <p className="text-sm font-semibold text-[#374151]">Mô Tả</p>
                  <p className="text-sm text-[#6B7280]">{camp.description || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin size={20} className="text-[#6366F1] mt-1" />
                <div>
                  <p className="text-sm font-semibold text-[#374151]">Địa Điểm</p>
                  <p className="text-sm text-[#6B7280]">{camp.place || 'N/A'}</p>
                  <p className="text-xs text-[#9CA3AF]">{camp.address || ''}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar size={20} className="text-[#6366F1] mt-1" />
                <div>
                  <p className="text-sm font-semibold text-[#374151]">Thời Gian</p>
                  <p className="text-sm text-[#6B7280]">
                    {formatDate(camp.startDate)} - {formatDate(camp.endDate)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock size={20} className="text-[#6366F1] mt-1" />
                <div>
                  <p className="text-sm font-semibold text-[#374151]">Thời Gian Đăng Ký</p>
                  <p className="text-sm text-[#6B7280]">
                    {formatDateTime(camp.registrationStartDate)}
                  </p>
                  <p className="text-sm text-[#6B7280]">
                    đến {formatDateTime(camp.registrationEndDate)}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Users size={20} className="text-[#6366F1] mt-1" />
                <div>
                  <p className="text-sm font-semibold text-[#374151]">Số Lượng Trại Viên</p>
                  <p className="text-sm text-[#6B7280]">
                    Tối thiểu: {camp.minParticipants} - Tối đa: {camp.maxParticipants}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <User size={20} className="text-[#6366F1] mt-1" />
                <div>
                  <p className="text-sm font-semibold text-[#374151]">Độ Tuổi</p>
                  <p className="text-sm text-[#6B7280]">
                    {camp.minAge} - {camp.maxAge} tuổi
                  </p>
                </div>
              </div>



              {camp.campType && (
                <div className="flex items-start gap-3">
                  <Info size={20} className="text-[#6366F1] mt-1" />
                  <div>
                    <p className="text-sm font-semibold text-[#374151]">Phân Loại Hội Trại</p>
                    <p className="text-sm text-[#6B7280]">{camp.campType.name}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* View All Campers Button */}
          <div className="mt-6 pt-6 border-t border-[#E5E7EB]">
            <button
              onClick={handleViewAllCampers}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-[#6366F1] text-white rounded-lg hover:bg-[#4F46E5] transition-all font-medium"
            >
              <Users size={20} />
              Xem Tất Cả Trại Viên
            </button>
          </div>
        </div>
      </div>

      {/* Assignment Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Group Assignment */}
        {group && (
          <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-[#E5E7EB]">
              <div className="flex items-center gap-2">
                <Users size={20} className="text-green-600" />
                <h3 className="text-lg font-bold text-[#111827]">Nhóm Phụ Trách</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-semibold text-[#374151]">Tên Nhóm</p>
                  <p className="text-sm text-[#6B7280]">{group.groupName}</p>
                </div>
                <button
                  onClick={handleViewGroupCampers}
                  className="w-full mt-4 inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-medium text-sm"
                >
                  <Users size={16} />
                  Xem Trại Viên Trong Nhóm
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Accommodation Assignment */}
        {accommodation && (
          <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-orange-50 to-amber-50 border-b border-[#E5E7EB]">
              <div className="flex items-center gap-2">
                <Home size={20} className="text-orange-600" />
                <h3 className="text-lg font-bold text-[#111827]">Chỗ Ở Phụ Trách</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-semibold text-[#374151]">Tên Chỗ Ở</p>
                  <p className="text-sm text-[#6B7280]">{accommodation.name}</p>
                </div>
                <button
                  onClick={handleViewAccommodationCampers}
                  className="w-full mt-4 inline-flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all font-medium text-sm"
                >
                  <Users size={16} />
                  Xem Trại Viên Trong Chỗ Ở
                </button>
              </div>
            </div>
          </div>
        )}

        {/* No Assignments */}
        {!group && !accommodation && (
          <div className="col-span-2 bg-blue-50 border-2 border-blue-200 rounded-lg p-8">
            <div className="text-center">
              <Info size={48} className="mx-auto mb-4 text-blue-600" />
              <h3 className="text-lg font-bold text-blue-900 mb-2">
                Chưa Được Phân Công
              </h3>
              <p className="text-blue-700">
                Bạn chưa được phân công vào nhóm hoặc chỗ ở nào cho trại này.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* All Campers Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <Users size={20} className="text-[#6366F1]" />
            <span>Tất Cả Trại Viên Trong {camp.name}</span>
          </div>
        }
        open={showCampersModal}
        onCancel={() => setShowCampersModal(false)}
        footer={null}
        width={800}
        centered
      >
        <Spin spinning={loadingCampers}>
          <div className="max-h-[500px] overflow-y-auto">
            {allCampers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Không tìm thấy trại viên
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {allCampers.map((camper) => (
                  <div
                    key={camper.camperId}
                    onClick={() => {
                      setSelectedCamperId(camper.camperId);
                      setCamperDetailModalOpen(true);
                    }}
                    className="py-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50 rounded-lg px-2 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold">
                      {camper.camperName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{camper.camperName}</p>
                      <p className="text-sm text-gray-500">
                        {camper.gender} • Ngày sinh: {formatDate(camper.dob)}
                      </p>
                    </div>
                    {camper.camperRegistrationStatus && (
                      <Tag color="blue">{camper.camperRegistrationStatus}</Tag>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Spin>
      </Modal>

      {/* Group Campers Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <Users size={20} className="text-green-600" />
            <span>Trại Viên Trong {group?.groupName}</span>
          </div>
        }
        open={showGroupCampersModal}
        onCancel={() => setShowGroupCampersModal(false)}
        footer={null}
        width={800}
        centered
      >
        <Spin spinning={loadingCampers}>
          <div className="max-h-[500px] overflow-y-auto">
            {groupCampers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Không tìm thấy trại viên trong nhóm này
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {groupCampers.map((camper) => (
                  <div
                    key={camper.camperId}
                    onClick={() => {
                      setSelectedCamperId(camper.camperId);
                      setCamperDetailModalOpen(true);
                    }}
                    className="py-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50 rounded-lg px-2 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-bold">
                      {camper.camperName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{camper.camperName}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Spin>
      </Modal>

      {/* Accommodation Campers Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <Home size={20} className="text-orange-600" />
            <span>Trại Viên Trong {accommodation?.name}</span>
          </div>
        }
        open={showAccommodationCampersModal}
        onCancel={() => setShowAccommodationCampersModal(false)}
        footer={null}
        width={800}
        centered
      >
        <Spin spinning={loadingCampers}>
          <div className="max-h-[500px] overflow-y-auto">
            {accommodationCampers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Không tìm thấy trại viên trong chỗ ở này
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {accommodationCampers.map((camper) => (
                  <div
                    key={camper.camperId}
                    onClick={() => {
                      setSelectedCamperId(camper.camperId);
                      setCamperDetailModalOpen(true);
                    }}
                    className="py-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50 rounded-lg px-2 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-bold">
                      {camper.camperName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{camper.camperName}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Spin>
      </Modal>

      {/* Camper Detail Modal */}
      {selectedCamperId && (
        <CamperDetailModal
          isOpen={camperDetailModalOpen}
          onClose={() => {
            setCamperDetailModalOpen(false);
            setSelectedCamperId(null);
          }}
          camperId={selectedCamperId!}
          campId={selectedCampId}
        />
      )}
    </div>
  );
};

export default StaffCampDetail;
