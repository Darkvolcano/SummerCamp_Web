import React, { useEffect, useState, useMemo } from "react";
import { Spin, Empty, Modal, Form, Input, Select, DatePicker, Upload, Button, Checkbox } from "antd";
import {
  SearchOutlined,
  UserAddOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../services/userService";
import { useNotification } from "../../../contexts/NotificationContext";
import { PagePath } from "../../../enums/page-path.enum";
import camperService, {
  type CamperResponseDto,
  type CamperRequestDto,
  type HealthRecordCreateDto,
} from "../../../services/camperService";

const MyCampers: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { toastError, toastSuccess } = useNotification();
  const [campers, setCampers] = useState<CamperResponseDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newCamperForm] = Form.useForm();
  const [camperAvatarPreview, setCamperAvatarPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchCampers = async () => {
      try {
        setLoading(true);
        const data = await camperService.getMyCampers();
        setCampers(data);
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message || "Không thể tải danh sách trại viên";
        toastError("Lỗi", errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchCampers();
    } else {
      navigate("/login");
    }
  }, [user, navigate, toastError]);

  const filteredCampers = useMemo(() => {
    return campers.filter((camper) => {
      const matchSearch = (camper.camperName || "")
        .toLowerCase()
        .includes(searchText.toLowerCase());
      return matchSearch;
    });
  }, [campers, searchText]);

  const getGenderDisplay = (gender: string) => {
    const genderMap: { [key: string]: string } = {
      Male: "Nam",
      Female: "Nữ",
      Other: "Khác",
    };
    return genderMap[gender] || gender;
  };

  const calculateAge = (dob: string) => {
    return dayjs().diff(dayjs(dob), "year");
  };

  const showNewCamperModal = () => {
    setIsModalVisible(true);
  };

  const handleNewCamperOk = async () => {
    try {
      setSubmitting(true);
      const values = await newCamperForm.validateFields();

      let dobValue = "";
      if (values.dob) {
        if (typeof values.dob === "string") {
          dobValue = values.dob;
        } else if (values.dob.format) {
          dobValue = values.dob.format("YYYY-MM-DD");
        }
      }

      const healthRecord: HealthRecordCreateDto | undefined =
        values.condition ||
        values.allergies ||
        values.isAllergy !== undefined ||
        values.healthNote
          ? {
              condition: values.condition || undefined,
              allergies: values.allergies || undefined,
              isAllergy: values.isAllergy || undefined,
              note: values.healthNote || undefined,
            }
          : undefined;

      const newCamperData: CamperRequestDto = {
        camperName: values.camperName,
        gender: values.gender,
        dob: dobValue,
        healthRecord,
      };

      const createdCamper = await camperService.createCamper(newCamperData);

      if (values.avatarFile) {
        await camperService.uploadCamperAvatar(
          createdCamper.camperId,
          values.avatarFile as File
        );
        const updatedCamper = await camperService.getCamperById(createdCamper.camperId);
        setCampers((prev) => [...prev, updatedCamper]);
      } else {
        setCampers((prev) => [...prev, createdCamper]);
      }

      setIsModalVisible(false);
      newCamperForm.resetFields();
      setCamperAvatarPreview(null);
      toastSuccess("Thành công", "Tạo trại viên mới thành công!");
    } catch (error) {
      console.error("Error creating new camper:", error);
      toastError("Lỗi", "Không thể tạo trại viên mới");
    } finally {
      setSubmitting(false);
    }
  };

  const handleNewCamperCancel = () => {
    setIsModalVisible(false);
    newCamperForm.resetFields();
    setCamperAvatarPreview(null);
  };

  const handleCamperAvatarChange = (info: any) => {
    const file = info.file;

    const reader = new FileReader();
    reader.onload = (e) => {
      setCamperAvatarPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    newCamperForm.setFieldValue("avatarFile", file);
  };

  if (loading && campers.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white py-20">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-gray-600 font-medium">
            Đang tải danh sách trại viên...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-white py-20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-2">
            Danh sách trại viên của tôi
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Quản lý trạng thái các trại viên của bạn
          </p>

          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="mb-6">
              <p className="text-sm font-bold text-gray-900 mb-3">Tìm kiếm:</p>
              <div className="relative">
                <SearchOutlined
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg"
                  style={{ color: "gray" }}
                />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên trại viên..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF8F50] focus:border-transparent"
                />
              </div>
            </div>

            <button
              onClick={showNewCamperModal}
              className="w-full px-6 py-3 bg-[#FF8F50] text-white rounded-lg font-medium hover:bg-[#ff7e3d] transition-colors flex items-center justify-center gap-2"
            >
              <UserAddOutlined />
              Thêm trại viên mới
            </button>
          </div>

          {filteredCampers.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-12 text-center">
              <Empty
                description="Không tìm thấy trại viên"
                style={{ marginBottom: 0 }}
              />
              <button
                onClick={showNewCamperModal}
                className="mt-6 px-6 py-2 bg-[#FF8F50] text-white rounded-full font-medium hover:bg-[#ff7e3d] transition-colors"
              >
                Tạo trại viên đầu tiên
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCampers.map((camper, index) => (
                <div
                  key={camper.camperId}
                  className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center justify-between gap-6">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <p className="text-sm font-bold text-gray-600">
                          {index + 1}
                        </p>
                      </div>

                      {camper.avatar ? (
                        <img
                          src={camper.avatar}
                          alt={camper.camperName}
                          className="w-14 h-14 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-[#FF8F50] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                          {camper.camperName.charAt(0).toUpperCase()}
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {camper.camperName}
                        </h3>
                      </div>
                    </div>

                    <div className="hidden md:grid md:grid-cols-3 gap-6 flex-1">
                      <div className="text-center">
                        <p className="text-xs text-gray-500 font-medium mb-2">
                          GIỚI TÍNH
                        </p>
                        <span className="inline-block text-xs font-medium px-3 py-1.5 rounded-full bg-blue-100 text-blue-700">
                          {getGenderDisplay(camper.gender)}
                        </span>
                      </div>

                      <div className="text-center">
                        <p className="text-xs text-gray-500 font-medium mb-2">
                          NGÀY SINH
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          {dayjs(camper.dob).format("DD/MM/YYYY")}
                        </p>
                      </div>

                      <div className="text-center">
                        <p className="text-xs text-gray-500 font-medium mb-2">
                          TUỔI
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          {calculateAge(camper.dob)} tuổi
                        </p>
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      <button
                        onClick={() => navigate(PagePath.USER_CAMPER_DETAIL.replace(":camperId", camper.camperId.toString()))}
                        className="flex items-center justify-center gap-1 bg-blue-500 text-white font-medium py-2 px-4 rounded-full text-sm hover:bg-blue-600 transition-colors whitespace-nowrap"
                      >
                        <EyeOutlined />
                        Xem chi tiết
                      </button>
                    </div>
                  </div>

                  <div className="md:hidden mt-4 pt-4 border-t border-gray-200 grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-xs text-gray-500 font-medium mb-1">
                        GIỚI TÍNH
                      </p>
                      <span className="inline-block text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                        {getGenderDisplay(camper.gender)}
                      </span>
                    </div>

                    <div className="text-center">
                      <p className="text-xs text-gray-500 font-medium mb-1">
                        NGÀY SINH
                      </p>
                      <p className="text-xs font-medium text-gray-900">
                        {dayjs(camper.dob).format("DD/MM/YY")}
                      </p>
                    </div>

                    <div className="text-center">
                      <p className="text-xs text-gray-500 font-medium mb-1">
                        TUỔI
                      </p>
                      <p className="text-xs font-medium text-gray-900">
                        {calculateAge(camper.dob)} tuổi
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal
        title="Đăng ký trại viên mới"
        open={isModalVisible}
        onOk={handleNewCamperOk}
        onCancel={handleNewCamperCancel}
        okText="Thêm"
        cancelText="Hủy"
        confirmLoading={submitting}
        width={700}
      >
        <Form form={newCamperForm} layout="vertical">
          <Form.Item
            label="Tên trại viên"
            name="camperName"
            rules={[
              { required: true, message: "Vui lòng nhập tên trại viên" },
            ]}
          >
            <Input placeholder="Nhập tên trại viên" />
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
            <DatePicker
              format="DD/MM/YYYY"
              placeholder="Chọn ngày sinh"
              className="w-full"
            />
          </Form.Item>

          <Form.Item
            label="Ảnh đại diện"
            name="avatarFile"
            rules={[
              { required: true, message: "Vui lòng chọn ảnh đại diện" },
            ]}
          >
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
                      newCamperForm.setFieldValue("avatarFile", undefined);
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
                name="avatarFile"
                accept="image/*"
                beforeUpload={() => false}
                onChange={handleCamperAvatarChange}
                maxCount={1}
              >
                <Button block>Chọn ảnh</Button>
              </Upload>
            </div>
          </Form.Item>

          <div className="border-t border-gray-200 pt-4 mt-4">
            <h3 className="text-base font-semibold text-gray-900 mb-4">
              Thông tin sức khỏe (Tùy chọn)
            </h3>

            <Form.Item label="Tình trạng sức khỏe" name="condition">
              <Input.TextArea
                placeholder="VD: Hen phế quản, tiểu đường, v.v..."
                rows={2}
              />
            </Form.Item>

            <Form.Item label="Dị ứng" name="allergies">
              <Input.TextArea
                placeholder="VD: Dị ứng với dâu tây, các loại cá, v.v..."
                rows={2}
              />
            </Form.Item>

            <Form.Item name="isAllergy" valuePropName="checked">
              <Checkbox>Trại viên có dị ứng</Checkbox>
            </Form.Item>

            <Form.Item label="Ghi chú thêm" name="healthNote">
              <Input.TextArea
                placeholder="Các thông tin y tế khác cần lưu ý..."
                rows={2}
              />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default MyCampers;
