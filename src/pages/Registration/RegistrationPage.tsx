import React, { useState, useEffect } from "react";
import {
  Form,
  Button,
  InputNumber,
  Select,
  Checkbox,
  Input,
  message,
  Spin,
  Modal,
  Upload,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useParams } from "react-router-dom";
import camperService, {
  type CamperResponseDto,
  type CamperRequestDto,
} from "../../services/camperService";
import registrationService, {
  type CreateRegistrationRequestDto,
} from "../../services/registrationService";
import campService, { type CampResponseDto } from "../../services/campService";
import promotionService, {
  type PromotionResponseDto,
} from "../../services/promotionService";
import { useAuthStore } from "../../services/userService";
import "./RegistrationPage.css";

const RegistrationPage: React.FC = () => {
  const { campId } = useParams<{ campId: string }>();
  const { user } = useAuthStore();
  const [form] = Form.useForm();

  // State for campers
  const [numCampers, setNumCampers] = useState<number>(1);
  const [campers, setCampers] = useState<(CamperResponseDto | null)[]>([null]);
  const [myCampers, setMyCampers] = useState<CamperResponseDto[]>([]);
  const [registrationCampers, setRegistrationCampers] = useState<
    CamperRequestDto[]
  >([]);

  // State for camp selection
  const [camps, setCamps] = useState<CampResponseDto[]>([]);
  const [selectedCampId, setSelectedCampId] = useState<number | null>(
    campId ? parseInt(campId) : null
  );
  const [selectedCamp, setSelectedCamp] = useState<CampResponseDto | null>(
    null
  );

  // State for promotions
  const [promotions, setPromotions] = useState<PromotionResponseDto[]>([]);
  const [selectedPromotionId, setSelectedPromotionId] = useState<number | null>(
    null
  );

  // State for terms & conditions
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Loading states
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Modal for new camper registration
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newCamperForm] = Form.useForm();
  const [newCamperIndex, setNewCamperIndex] = useState<number | null>(null);
  const [camperAvatarPreview, setCamperAvatarPreview] = useState<string | null>(
    null
  );

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [campsData, promotionsData, myCampersData] = await Promise.all([
          campService.getAllCamps(),
          promotionService.getAllPromotions(),
          camperService.getMyCampers(),
        ]);

        setCamps(campsData);
        setPromotions(promotionsData);
        setMyCampers(myCampersData);

        // Set selected camp if campId from URL
        if (campId) {
          const campIdNum = parseInt(campId);
          setSelectedCampId(campIdNum);
          const selectedCampData = campsData.find(
            (c) => c.campId === campIdNum
          );
          setSelectedCamp(selectedCampData || null);
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
        message.error("Không thể tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [campId]);

  // Handle number of campers change
  const handleNumCampersChange = (value: number | null) => {
    if (value && value > 0) {
      setNumCampers(value);
      const newCampers = new Array(value).fill(null);
      setCampers(newCampers);
      setRegistrationCampers(new Array(value).fill({}));
    }
  };

  // Handle selecting existing camper
  const handleSelectExistingCamper = (index: number, camperId: number) => {
    const selectedCamper = myCampers.find((c) => c.camperId === camperId);
    if (selectedCamper) {
      const newCampers = [...campers];
      newCampers[index] = selectedCamper;
      setCampers(newCampers);

      const newRegistrationCampers = [...registrationCampers];
      newRegistrationCampers[index] = {
        camperName: selectedCamper.camperName,
        gender: selectedCamper.gender,
        dob: selectedCamper.dob,
        groupId: selectedCamper.groupId,
        avatar: selectedCamper.avatar,
      };
      setRegistrationCampers(newRegistrationCampers);
    }
  };

  // Handle register new camper modal
  const showNewCamperModal = (index: number) => {
    setNewCamperIndex(index);
    setIsModalVisible(true);
  };

  const handleNewCamperOk = async () => {
    try {
      const values = await newCamperForm.validateFields();
      const newCamperData: CamperRequestDto = {
        camperName: values.camperName,
        gender: values.gender,
        dob: values.dob,
        groupId: values.groupId || null,
        avatar: values.avatar || null,
      };

      // Call API to create camper
      const createdCamper = await camperService.createCamper(newCamperData);

      const newCampers = [...campers];
      const newRegistrationCampers = [...registrationCampers];

      if (newCamperIndex !== null) {
        // Use the created camper from API
        newRegistrationCampers[newCamperIndex] = {
          camperName: createdCamper.camperName,
          gender: createdCamper.gender,
          dob: createdCamper.dob,
          groupId: createdCamper.groupId,
          avatar: createdCamper.avatar,
        };
        setRegistrationCampers(newRegistrationCampers);

        // Set the actual created camper with ID from API
        newCampers[newCamperIndex] = createdCamper;
        setCampers(newCampers);
      }

      setIsModalVisible(false);
      newCamperForm.resetFields();
      message.success("Tạo học sinh mới thành công!");
    } catch (error) {
      console.error("Error creating new camper:", error);
      message.error("Không thể tạo học sinh mới");
    }
  };

  const handleNewCamperCancel = () => {
    setIsModalVisible(false);
    newCamperForm.resetFields();
    setCamperAvatarPreview(null);
  };

  // Handle camper avatar upload
  const handleCamperAvatarChange = (info: any) => {
    const file = info.file;

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setCamperAvatarPreview(e.target?.result as string);
      // Store base64 or file URL in form
      newCamperForm.setFieldValue("avatar", e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle camp selection
  const handleCampChange = (value: number) => {
    setSelectedCampId(value);
    const camp = camps.find((c) => c.campId === value);
    setSelectedCamp(camp || null);
  };

  // Calculate total price
  const calculateTotalPrice = () => {
    if (!selectedCamp) return 0;
    let total = selectedCamp.price * numCampers;
    if (selectedPromotionId) {
      const promotion = promotions.find((p) => p.id === selectedPromotionId);
      if (promotion) {
        const discount = (total * promotion.percent) / 100;
        total -= Math.min(discount, promotion.maxDiscountAmount);
      }
    }
    return total;
  };

  // Handle registration submission
  const handleSubmit = async () => {
    if (!selectedCampId) {
      message.error("Vui lòng chọn trại hè");
      return;
    }

    if (!agreeTerms) {
      message.error("Vui lòng đồng ý với quy định");
      return;
    }

    if (registrationCampers.some((c) => !c.camperName)) {
      message.error("Vui lòng điền đầy đủ thông tin tất cả học sinh");
      return;
    }

    try {
      setSubmitting(true);

      // Get camper IDs for existing campers
      const camperIds = campers
        .map((c) => c?.camperId)
        .filter((id) => id && id !== 0) as number[];

      const registrationData: CreateRegistrationRequestDto = {
        camperIds: camperIds.length > 0 ? camperIds : null,
        campId: selectedCampId,
        appliedPromotionId: selectedPromotionId || null,
        note: form.getFieldValue("note") || null,
      };

      const result = await registrationService.createRegistration(
        registrationData
      );
      message.success(
        "Đăng ký đã được gửi phê duyệt! Vui lòng chờ xác nhận từ nhà trường."
      );

      // Reset form and redirect
      form.resetFields();
      console.log("Registration submitted for approval:", result);

      // TODO: Redirect to my registrations page or show confirmation modal
      // navigate(PagePath.MY_REGISTRATIONS);
    } catch (error) {
      console.error("Error creating registration:", error);
      message.error("Không thể tạo đăng ký");
    } finally {
      setSubmitting(false);
    }
  };

  const REGULATIONS = [
    "Đối với các lớp trại hè không đủ số lượng học sinh đăng ký để mở lớp (tối thiểu từ 10 học sinh/ lớp tuỳ từng trại hè), nhà trường sẽ hoàn lại phí hè Phụ huynh đã đóng cho học sinh",
    "Nhà trường chỉ xếp lớp khi đã tiếp nhận đầy đủ đăng ký và khoản phí theo yêu cầu",
    "Học sinh khi mắc bệnh truyền nhiễm phải được nghỉ ở nhà, Phụ huynh cần nộp cho nhà trường giấy khám sức khỏe khi Học sinh đi học lại",
    "Phụ huynh ủy quyền cho nhà trường trong trường hợp Học sinh cần cấp cứu y khoa, nhà trường sẽ đưa Học sinh đến Bệnh viện có đủ khả năng cấp cứu gần nhất. Phụ huynh vui lòng thanh toán hoặc hoàn trả cho nhà trường các chi phí thăm khám và điều trị cho Học sinh",
    "Nhà trường sẽ tổ chức chụp ảnh, ghi hình các hoạt động của Học sinh khi tham gia chương trình và có quyền sử dụng các hình ảnh này vào mục đích liên quan đến hoạt động giáo dục và quảng bá của trường",
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="registration-page min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Đăng ký trại hè
        </h1>

        <Form form={form} layout="vertical" className="space-y-8">
          {/* Step 1: Select Number of Campers */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              1. Chọn số lượng học sinh
            </h2>
            <Form.Item
              label="Số lượng học sinh cần đăng ký"
              name="numCampers"
              rules={[{ required: true, message: "Vui lòng chọn số lượng" }]}
            >
              <InputNumber
                min={1}
                max={20}
                value={numCampers}
                onChange={handleNumCampersChange}
                className="w-full"
              />
            </Form.Item>
          </div>

          {/* Step 2: Camper Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              2. Thông tin học sinh
            </h2>
            <div className="space-y-6">
              {Array.from({ length: numCampers }).map((_, index) => (
                <div
                  key={index}
                  className="border-l-4 border-[#FF8F50] pl-6 py-4 bg-gray-50 rounded"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Học sinh {index + 1}
                  </h3>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <Select
                      placeholder="Chọn học sinh đã có"
                      allowClear
                      optionLabelProp="label"
                      onChange={(value) =>
                        handleSelectExistingCamper(index, value)
                      }
                      className="col-span-2"
                    >
                      {myCampers.map((camper) => (
                        <Select.Option
                          key={camper.camperId}
                          value={camper.camperId}
                        >
                          {camper.camperName} ({camper.gender})
                        </Select.Option>
                      ))}
                    </Select>
                  </div>

                  {campers[index] && (
                    <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-white rounded border border-gray-200">
                      <div>
                        <p className="text-sm text-gray-600">Tên học sinh</p>
                        <p className="font-semibold text-gray-900">
                          {campers[index]?.camperName}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Giới tính</p>
                        <p className="font-semibold text-gray-900">
                          {campers[index]?.gender}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Ngày sinh</p>
                        <p className="font-semibold text-gray-900">
                          {campers[index]?.dob}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Nhóm</p>
                        <p className="font-semibold text-gray-900">
                          {campers[index]?.groupId || "Chưa xếp"}
                        </p>
                      </div>
                    </div>
                  )}

                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    block
                    onClick={() => showNewCamperModal(index)}
                    className="bg-[#FF8F50] border-[#FF8F50]"
                  >
                    Đăng ký học sinh mới
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Step 3: Guardian Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              3. Thông tin người giám hộ
            </h2>
            <div className="bg-blue-50 p-4 rounded mb-4">
              <p className="text-sm text-blue-800">
                ℹ️ Hiện tại, thông tin người giám hộ sẽ được lấy từ tài khoản
                của bạn. Nếu cần thay đổi, vui lòng cập nhật thông tin cá nhân.
              </p>
            </div>
            {user && (
              <div className="p-4 bg-gray-50 rounded border border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Tên</p>
                    <p className="font-semibold text-gray-900">
                      {user.fullName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-semibold text-gray-900">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Số điện thoại</p>
                    <p className="font-semibold text-gray-900">
                      {user.phone_number || "Chưa cập nhật"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Step 4: Select Camp */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              4. Chọn trại hè
            </h2>
            <Form.Item
              label="Trại hè"
              name="campId"
              initialValue={selectedCampId}
              rules={[{ required: true, message: "Vui lòng chọn trại hè" }]}
            >
              <Select
                placeholder="Chọn trại hè"
                onChange={handleCampChange}
                optionLabelProp="label"
              >
                {camps.map((camp) => (
                  <Select.Option
                    key={camp.campId}
                    value={camp.campId}
                    label={camp.name}
                  >
                    <div>
                      <p className="font-semibold">{camp.name}</p>
                      <p className="text-sm text-gray-500">
                        {camp.description}
                      </p>
                    </div>
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            {selectedCamp && (
              <div className="p-4 bg-blue-50 rounded border border-blue-200 mt-4">
                <h3 className="font-semibold text-gray-900 mb-2">
                  {selectedCamp.name}
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Địa điểm</p>
                    <p className="font-semibold text-gray-900">
                      {selectedCamp.place}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Độ tuổi</p>
                    <p className="font-semibold text-gray-900">
                      {selectedCamp.minAge} - {selectedCamp.maxAge} tuổi
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Giá tiền</p>
                    <p className="font-semibold text-gray-900">
                      {selectedCamp.price?.toLocaleString()} VNĐ
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Trạng thái</p>
                    <p className="font-semibold text-gray-900">
                      {selectedCamp.status}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Step 5: Summary & Promotion */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              5. Tóm tắt & Khuyến mãi
            </h2>

            <Form.Item label="Áp dụng mã khuyến mãi" name="promotionId">
              <Select
                placeholder="Chọn mã khuyến mãi (tùy chọn)"
                allowClear
                onChange={setSelectedPromotionId}
              >
                {promotions
                  .filter((p) => p.status === "Active")
                  .map((promo) => (
                    <Select.Option key={promo.id} value={promo.id}>
                      {promo.name} - {promo.percent}% Off (Max:{" "}
                      {promo.maxDiscountAmount?.toLocaleString()} VNĐ)
                    </Select.Option>
                  ))}
              </Select>
            </Form.Item>

            <Form.Item label="Ghi chú" name="note">
              <Input.TextArea placeholder="Thêm ghi chú (tùy chọn)" rows={3} />
            </Form.Item>

            {selectedCamp && (
              <div className="bg-gray-50 rounded p-4 border border-gray-200">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700">
                    Giá cơ bản ({numCampers} học sinh)
                  </span>
                  <span className="font-semibold">
                    {(selectedCamp.price * numCampers).toLocaleString()} VNĐ
                  </span>
                </div>
                {selectedPromotionId && (
                  <div className="flex justify-between mb-2 text-red-600">
                    <span>Chiết khấu</span>
                    <span className="font-semibold">
                      -
                      {(
                        selectedCamp.price * numCampers -
                        calculateTotalPrice()
                      ).toLocaleString()}{" "}
                      VNĐ
                    </span>
                  </div>
                )}
                <div className="border-t border-gray-300 pt-2 flex justify-between">
                  <span className="text-lg font-bold text-gray-900">
                    Tổng cộng
                  </span>
                  <span className="text-2xl font-bold text-[#FF8F50]">
                    {calculateTotalPrice().toLocaleString()} VNĐ
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Step 6: Regulations & Agreement */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              6. Quy định & Đồng ý
            </h2>

            <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">
                📋 Quy định của nhà trường
              </h3>
              <ul className="space-y-3">
                {REGULATIONS.map((reg, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="text-[#FF8F50] font-bold flex-shrink-0">
                      •
                    </span>
                    <span className="text-sm text-gray-700">{reg}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Form.Item
              name="agreeTerms"
              valuePropName="checked"
              rules={[
                {
                  validator: (_, value) =>
                    value
                      ? Promise.resolve()
                      : Promise.reject(
                          new Error("Vui lòng đồng ý với quy định")
                        ),
                },
              ]}
            >
              <Checkbox onChange={(e) => setAgreeTerms(e.target.checked)}>
                <span className="text-gray-700">
                  Tôi đã đọc và đồng ý với tất cả các quy định trên
                </span>
              </Checkbox>
            </Form.Item>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <Button className="flex-1" size="large">
              Hủy
            </Button>
            <Button
              type="primary"
              size="large"
              loading={submitting}
              disabled={!agreeTerms}
              onClick={handleSubmit}
              className="flex-1 bg-[#FF8F50] border-[#FF8F50] h-12 text-lg font-bold"
            >
              Gửi đăng ký
            </Button>
          </div>
        </Form>
      </div>

      {/* Modal for New Camper Registration */}
      <Modal
        title="Đăng ký học sinh mới"
        open={isModalVisible}
        onOk={handleNewCamperOk}
        onCancel={handleNewCamperCancel}
        okText="Thêm"
        cancelText="Hủy"
      >
        <Form form={newCamperForm} layout="vertical">
          <Form.Item
            label="Tên học sinh"
            name="camperName"
            rules={[{ required: true, message: "Vui lòng nhập tên học sinh" }]}
          >
            <Input placeholder="Nhập tên học sinh" />
          </Form.Item>

          <Form.Item
            label="Giới tính"
            name="gender"
            rules={[{ required: true, message: "Vui lòng chọn giới tính" }]}
          >
            <Select placeholder="Chọn giới tính">
              <Select.Option value="Nam">Nam</Select.Option>
              <Select.Option value="Nữ">Nữ</Select.Option>
              <Select.Option value="Khác">Khác</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Ngày sinh"
            name="dob"
            rules={[{ required: true, message: "Vui lòng chọn ngày sinh" }]}
          >
            <Input type="date" />
          </Form.Item>

          <Form.Item label="Ảnh đại diện" name="avatar">
            <div className="space-y-4">
              {camperAvatarPreview ? (
                <div className="flex flex-col items-center gap-4">
                  <img
                    src={camperAvatarPreview}
                    alt="Preview"
                    className="w-32 h-32 rounded-lg object-cover border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setCamperAvatarPreview(null);
                      newCamperForm.setFieldValue("avatar", undefined);
                    }}
                    className="text-sm text-red-500 hover:text-red-700"
                  >
                    Xóa ảnh
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <div className="text-4xl mb-2">📷</div>
                  <p className="text-gray-600 mb-2">Chưa có ảnh</p>
                </div>
              )}
              <Upload
                name="avatar"
                accept="image/*"
                beforeUpload={() => false}
                onChange={handleCamperAvatarChange}
                maxCount={1}
              >
                <Button block>Chọn ảnh</Button>
              </Upload>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RegistrationPage;
