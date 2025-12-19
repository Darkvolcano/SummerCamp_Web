import React, { useState, useEffect } from 'react';
import { Modal, Spin, Tabs, Form, Input, Upload, Button, Popover, Select } from 'antd';
import { User, Calendar, Heart, Users, Tent, MapPin, Mail, Phone, UserCircle, LogOut, Upload as UploadIcon, AlertTriangle } from 'lucide-react';
import { WarningOutlined } from '@ant-design/icons';
import camperService, {
  type CamperResponseDto,
  type Guardian,
} from '../services/camperService';
import registrationCamperService, {
  type RegistrationCamperResponseDto,
} from '../services/registrationCamperService';
import reportService from '../services/reportService';
import activityScheduleService, { type ActivityScheduleResponseDto } from '../services/activityScheduleService';
import { uploadGenericImage } from '../services/uploadService';
import { useAuthStore } from '../services/userService';
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
  const { toastError, toastSuccess } = useNotification();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [camperData, setCamperData] = useState<CamperResponseDto | null>(null);
  const [campRegistration, setCampRegistration] = useState<RegistrationCamperResponseDto | null>(null);
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [activeTab, setActiveTab] = useState('info');
  
  const [showEarlyCheckoutModal, setShowEarlyCheckoutModal] = useState(false);
  const [earlyCheckoutForm] = Form.useForm();
  const [submittingCheckout, setSubmittingCheckout] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [showPopover, setShowPopover] = useState(false);
  
  // Incident Ticket states
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [incidentForm] = Form.useForm();
  const [submittingIncident, setSubmittingIncident] = useState(false);
  const [incidentImageFile, setIncidentImageFile] = useState<File | null>(null);
  const [activitySchedules, setActivitySchedules] = useState<ActivityScheduleResponseDto[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);

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
      let errorMsg = 'Không thể tải chi tiết trại viên';
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      }
      toastError('Lỗi', errorMsg);
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
    setShowPopover(false);
    setShowEarlyCheckoutModal(false);
    setShowIncidentModal(false);
    earlyCheckoutForm.resetFields();
    incidentForm.resetFields();
    setImageFile(null);
    setIncidentImageFile(null);
    setActivitySchedules([]);
    onClose();
  };

  const handleEarlyCheckoutClick = () => {
    setShowPopover(false);
    setShowEarlyCheckoutModal(true);
  };

  const handleEarlyCheckoutSubmit = async () => {
    try {
      const values = await earlyCheckoutForm.validateFields();
      
      // Validate campId exists
      if (!campId) {
        toastError('Lỗi', 'Không tìm thấy thông tin trại');
        return;
      }
      
      setSubmittingCheckout(true);

      let imageUrl: string | null = null;
      if (imageFile) {
        const uploadResult = await uploadGenericImage(imageFile);
        imageUrl = uploadResult.url;
      }

      await reportService.reportEarlyCheckout({
        campId: campId,
        camperId: camperId,
        note: values.note || null,
        imageUrl: imageUrl,
      });

      toastSuccess('Thành công', 'Đã ghi nhận check out sớm');
      
      // Close all modals
      handleClose();
    } catch (error) {
      console.error('Error submitting early checkout:', error);
      toastError('Lỗi', 'Không thể ghi nhận check out sớm');
    } finally {
      setSubmittingCheckout(false);
    }
  };

  const handleOpenIncidentModal = async () => {
    if (!campId) {
      toastError('Lỗi', 'Không tìm thấy thông tin trại');
      return;
    }

    setShowIncidentModal(true);
    
    // Fetch activity schedules for this camper
    try {
      setLoadingActivities(true);
      const schedules = await activityScheduleService.getActivitySchedulesByCamperAndCamp(campId, camperId);
      setActivitySchedules(schedules);
    } catch (error) {
      console.error('Error fetching activity schedules:', error);
      toastError('Lỗi', 'Không thể tải danh sách hoạt động');
    } finally {
      setLoadingActivities(false);
    }
  };

  const handleIncidentSubmit = async () => {
    try {
      const values = await incidentForm.validateFields();
      
      if (!campId) {
        toastError('Lỗi', 'Không tìm thấy thông tin trại');
        return;
      }
      
      setSubmittingIncident(true);

      let imageUrl: string | null = null;
      if (incidentImageFile) {
        const uploadResult = await uploadGenericImage(incidentImageFile);
        imageUrl = uploadResult.url;
      }

      await reportService.createIncidentTicket({
        campId: campId,
        camperId: camperId,
        activityScheduleId: values.activityScheduleId || null,
        level: values.level,
        note: values.note || null,
        imageUrl: imageUrl,
      });

      toastSuccess('Thành công', 'Đã tạo incident ticket');
      
      // Close modal and reset
      setShowIncidentModal(false);
      incidentForm.resetFields();
      setIncidentImageFile(null);
    } catch (error) {
      console.error('Error creating incident ticket:', error);
      toastError('Lỗi', 'Không thể tạo incident ticket');
    } finally {
      setSubmittingIncident(false);
    }
  };

  const isStaff = user?.role === 'Staff';
  const isCheckedIn = campRegistration?.status === 'CheckedIn';

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <User size={20} className="text-[#6366F1]" />
          <span className="text-lg font-bold text-[#111827]">Chi Tiết Trại Viên</span>
        </div>
      }
      open={isOpen}
      onCancel={handleClose}
      footer={
        isStaff && isCheckedIn ? (
          <div className="flex justify-end gap-2">
            <Popover
              content={
                <div className="max-w-xs">
                  <p className="text-sm mb-3">Chưa đến hoạt động check out. Trại viên có muốn check out sớm?</p>
                  <div className="flex gap-2 justify-end">
                    <Button size="small" onClick={() => setShowPopover(false)}>Hủy</Button>
                    <Button 
                      size="small" 
                      type="primary" 
                      danger
                      onClick={handleEarlyCheckoutClick}
                    >
                      Xác nhận
                    </Button>
                  </div>
                </div>
              }
              title="Check Out Sớm"
              trigger="click"
              open={showPopover}
              onOpenChange={setShowPopover}
            >
              <Button 
                type="primary" 
                danger
                icon={<LogOut size={16} />}
              >
                Check Out Sớm
              </Button>
            </Popover>
          </div>
        ) : null
      }
      width={700}
      centered
    >
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Spin size="large" tip="Đang tải chi tiết trại viên..." />
        </div>
      ) : camperData ? (
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'info',
              label: 'Thông Tin',
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
                          <span className="font-medium">Giới tính:</span> {camperData.gender}
                        </span>
                        <span>
                          <span className="font-medium">Tuổi:</span> {calculateAge(camperData.dob)} tuổi
                        </span>
                      </div>
                      <div className="mt-2 text-sm text-[#6B7280]">
                        <span className="font-medium">Ngày sinh:</span> {formatDate(camperData.dob)}
                      </div>
                      {/* Camper Status */}
                      {campRegistration && campRegistration.status && (
                        <div className="mt-3">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                            {campRegistration.status}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Parent Information */}
                  {campRegistration && campRegistration.userAccount && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 pb-2 border-b-2 border-blue-600 inline-block">
                        Thông Tin Phụ Huynh
                      </h3>
                      <div className="space-y-3 mt-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[#EFF6FF] flex items-center justify-center flex-shrink-0">
                            <User size={18} className="text-[#3B82F6]" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-[#6B7280] font-medium">Tên Phụ Huynh/Người Giám Hộ</p>
                            <p className="text-sm text-[#111827] font-semibold">
                              {campRegistration.userAccount.fullName}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Health Information */}
                  {camperData.healthRecord && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 pb-2 border-b-2 border-blue-600 inline-block">
                        Thông Tin Sức Khỏe
                      </h3>
                      <div className="space-y-3 mt-4">
                        {camperData.healthRecord.condition && (
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#EFF6FF] flex items-center justify-center flex-shrink-0">
                              <Heart size={18} className="text-[#3B82F6]" />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs text-[#6B7280] font-medium">Tình Trạng Y Tế</p>
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
                              <p className="text-xs text-[#6B7280] font-medium">Dị Ứng</p>
                              <p className="text-sm text-[#111827] font-medium">
                                {camperData.healthRecord.allergies || 'Có'}
                              </p>
                            </div>
                          </div>
                        )}

                        {camperData.healthRecord.note && (
                          <div className="bg-[#F9FAFB] rounded-lg p-4 border border-[#E5E7EB]">
                            <p className="text-xs text-[#6B7280] font-medium mb-1">Ghi Chú Thêm</p>
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
                        Đăng Ký Trại
                      </h3>
                      <div className="space-y-3 mt-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[#EFF6FF] flex items-center justify-center flex-shrink-0">
                            <Tent size={18} className="text-[#3B82F6]" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-[#6B7280] font-medium">Tên Trại</p>
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
                            <p className="text-xs text-[#6B7280] font-medium">Thời Gian Trại</p>
                            <p className="text-sm text-[#111827] font-medium">
                              {formatDate(campRegistration.camp.startDate)} -{' '}
                              {formatDate(campRegistration.camp.endDate)}
                            </p>
                          </div>
                        </div>

                        {/* Group Information */}
                        {campRegistration.groupName ? (
                          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                                <Users size={18} className="text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <p className="text-xs text-blue-600 font-semibold uppercase mb-1">Nhóm Được Phân Công</p>
                                <p className="text-sm text-[#111827] font-bold mb-2">
                                  {campRegistration.groupName.groupName}
                                </p>
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 text-xs text-gray-700">
                                    <span className="font-medium">Người Phụ Trách:</span>
                                    <span>{campRegistration.groupName.supervisor.fullName}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <p className="text-sm text-gray-500 italic text-center">Chưa được phân công vào nhóm</p>
                          </div>
                        )}

                        {/* Accommodation Information */}
                        {campRegistration.accommodation ? (
                          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                                <Tent size={18} className="text-green-600" />
                              </div>
                              <div className="flex-1">
                                <p className="text-xs text-green-600 font-semibold uppercase mb-1">Chỗ Ở</p>
                                <p className="text-sm text-[#111827] font-bold mb-2">
                                  {campRegistration.accommodation.name}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-gray-700">
                                  <span className="font-medium">Người Phụ Trách:</span>
                                  <span>{campRegistration.accommodation.supervisor.fullName}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <p className="text-sm text-gray-500 italic text-center">Chưa được phân công chỗ ở</p>
                          </div>
                        )}

                        {campRegistration.requestTransport && (
                          <div className="bg-[#EFF6FF] rounded-lg p-4 border border-[#DBEAFE]">
                            <div className="flex items-center gap-2">
                              <MapPin size={18} className="text-[#3B82F6]" />
                              <p className="text-sm font-medium text-[#3B82F6]">
                                Yêu Cầu Đưa Đón
                              </p>
                            </div>
                          </div>
                        )}

                      </div>
                    </div>
                  )}

                  {/* Incident Ticket Button - Only for Staff */}
                  {isStaff && campId && (
                    <div className="mt-6 pt-6 border-t border-[#E5E7EB]">
                      <button
                        onClick={handleOpenIncidentModal}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-red-500 text-red-600 rounded-lg hover:bg-red-50 transition-all font-medium shadow-sm"
                      >
                        <WarningOutlined className="text-lg" />
                        Tạo Incident Ticket
                      </button>
                    </div>
                  )}
                </div>
              ),
            },
            {
              key: 'guardians',
              label: `Người Giám Hộ (${guardians.length})`,
              children: (
                <div className="space-y-4 min-h-[500px] max-h-[500px] overflow-y-auto pr-2">
                  {guardians.length === 0 ? (
                    <div className="text-center py-12 text-[#6B7280]">
                      <UserCircle size={48} className="mx-auto mb-4 text-gray-400" />
                      <p>Không có thông tin người giám hộ</p>
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
                                <span className="font-medium">Danh xưng:</span>
                                <span>{guardian.title}</span>
                                <span className="mx-1">•</span>
                                <span className="font-medium">Giới tính:</span>
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
          Không có dữ liệu trại viên
        </div>
      )}

      {/* Early Checkout Modal */}
      <Modal
        title="Check Out Sớm"
        open={showEarlyCheckoutModal}
        onCancel={() => {
          setShowEarlyCheckoutModal(false);
          earlyCheckoutForm.resetFields();
          setImageFile(null);
        }}
        onOk={handleEarlyCheckoutSubmit}
        okText="Xác Nhận Check Out"
        cancelText="Hủy"
        confirmLoading={submittingCheckout}
        okButtonProps={{ danger: true }}
      >
        <Form form={earlyCheckoutForm} layout="vertical" className="mt-4">
          <Form.Item
            label="Lý Do Check Out Sớm"
            name="note"
            rules={[{ required: true, message: 'Vui lòng nhập lý do' }]}
          >
            <Input.TextArea 
              rows={4} 
              placeholder="Nhập lý do trại viên check out sớm..."
            />
          </Form.Item>

          <Form.Item label="Hình Ảnh (Tùy chọn)">
            <Upload
              maxCount={1}
              listType="picture-card"
              beforeUpload={(file) => {
                setImageFile(file);
                return false;
              }}
              onRemove={() => setImageFile(null)}
              accept="image/*"
              fileList={
                imageFile
                  ? [
                      {
                        uid: '-1',
                        name: imageFile.name,
                        status: 'done',
                        url: URL.createObjectURL(imageFile),
                      },
                    ]
                  : []
              }
            >
              {!imageFile && (
                <div>
                  <UploadIcon size={20} />
                  <div style={{ marginTop: 8 }}>Tải Ảnh Lên</div>
                </div>
              )}
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      {/* Incident Ticket Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <AlertTriangle size={20} className="text-orange-500" />
            <span>Tạo Incident Ticket</span>
          </div>
        }
        open={showIncidentModal}
        onCancel={() => {
          setShowIncidentModal(false);
          incidentForm.resetFields();
          setIncidentImageFile(null);
        }}
        onOk={handleIncidentSubmit}
        okText="Tạo Ticket"
        cancelText="Hủy"
        confirmLoading={submittingIncident}
        okButtonProps={{ danger: true }}
        width={600}
      >
        <Form form={incidentForm} layout="vertical" className="mt-4">
          <Form.Item
            label="Hoạt Động (Tùy chọn)"
            name="activityScheduleId"
          >
            <Select
              placeholder="Chọn hoạt động liên quan (nếu có)"
              allowClear
              loading={loadingActivities}
              showSearch
              optionFilterProp="children"
            >
              {activitySchedules.map((schedule) => (
                <Select.Option key={schedule.activityScheduleId} value={schedule.activityScheduleId}>
                  {schedule.activity?.name || 'N/A'} - {new Date(schedule.startTime).toLocaleString('vi-VN')}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Mức Độ Nghiêm Trọng"
            name="level"
            rules={[{ required: true, message: 'Vui lòng chọn mức độ' }]}
          >
            <Select placeholder="Chọn mức độ nghiêm trọng">
              <Select.Option value={1}>
                <span className="text-green-600">🟢 Cấp 1 - Nhẹ</span>
              </Select.Option>
              <Select.Option value={2}>
                <span className="text-yellow-600">🟡 Cấp 2 - Trung bình</span>
              </Select.Option>
              <Select.Option value={3}>
                <span className="text-red-600">🔴 Cấp 3 - Nghiêm trọng</span>
              </Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Mô Tả Sự Cố"
            name="note"
            rules={[{ required: true, message: 'Vui lòng mô tả sự cố' }]}
          >
            <Input.TextArea 
              rows={4} 
              placeholder="Mô tả chi tiết sự cố xảy ra..."
            />
          </Form.Item>

          <Form.Item label="Hình Ảnh (Tùy chọn)">
            <Upload
              maxCount={1}
              listType="picture-card"
              beforeUpload={(file) => {
                setIncidentImageFile(file);
                return false;
              }}
              onRemove={() => setIncidentImageFile(null)}
              accept="image/*"
              fileList={
                incidentImageFile
                  ? [
                      {
                        uid: '-1',
                        name: incidentImageFile.name,
                        status: 'done',
                        url: URL.createObjectURL(incidentImageFile),
                      },
                    ]
                  : []
              }
            >
              {!incidentImageFile && (
                <div>
                  <UploadIcon size={20} />
                  <div style={{ marginTop: 8 }}>Tải Ảnh Lên</div>
                </div>
              )}
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </Modal>
  );
};

export default CamperDetailModal;
