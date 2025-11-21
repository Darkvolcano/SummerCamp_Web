import React, { useEffect, useState } from "react";
import { Form, Input, Spin, Modal, Avatar, DatePicker } from "antd";
import dayjs from "dayjs";
import {
  UserOutlined,
  EditOutlined,
  LogoutOutlined,
  LockOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../services/userService";
import { useNotification } from "../../../contexts/NotificationContext";
import userAccountService, {
  type UserAccountResponseDto,
  type UserProfileUpdateDto,
} from "../../../services/userAccountService";
import {
  uploadMyAvatar,
  validateImageFile,
} from "../../../services/uploadService";

const MyProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { toastSuccess, toastError } = useNotification();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<UserAccountResponseDto | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [changePasswordVisible, setChangePasswordVisible] = useState(false);
  const [changeEmailVisible, setChangeEmailVisible] = useState(false);
  const [changePasswordForm] = Form.useForm();
  const [changeEmailForm] = Form.useForm();

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const data = await userAccountService.getCurrentUser();
        setUserData(data);
        if (data.avatar) {
          setAvatarPreview(data.avatar);
        }
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message || "Không thể tải thông tin hồ sơ";
        toastError("Lỗi", errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchUserData();
    } else {
      navigate("/login");
    }
  }, [user, navigate, toastError]);

  // Populate form when userData changes
  useEffect(() => {
    if (userData) {
      form.setFieldsValue({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phoneNumber: userData.phoneNumber || "",
        dateOfBirth: userData.dateOfBirth ? dayjs(userData.dateOfBirth) : null,
      });
    }
  }, [userData, form]);

  // Handle avatar change and upload
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file, 5);
    if (!validation.valid) {
      toastError("Lỗi", validation.error || "File không hợp lệ");
      return;
    }

    try {
      setUploadingAvatar(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload avatar immediately
      const response = await uploadMyAvatar(file);
      setAvatarPreview(response.url);
      toastSuccess("Thành công", "Cập nhật avatar thành công");

      // Refresh user data
      const updatedUser = await userAccountService.getCurrentUser();
      setUserData(updatedUser);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Không thể upload avatar";
      toastError("Lỗi", errorMessage);
      // Reset preview on error
      setAvatarPreview(userData?.avatar || "");
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Handle profile update
  const handleUpdateProfile = async (values: any) => {
    try {
      setLoading(true);
      const updateData: UserProfileUpdateDto = {
        firstName: values.firstName,
        lastName: values.lastName,
        phoneNumber: values.phoneNumber || null,
        avatar: avatarPreview,
        dob: values.dateOfBirth
          ? values.dateOfBirth.format("YYYY-MM-DD")
          : "",
      };

      const updatedUser = await userAccountService.updateUserProfile(
        updateData
      );
      setUserData(updatedUser);
      toastSuccess("Thành công", "Cập nhật hồ sơ thành công");
      setIsEditingProfile(false);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Không thể cập nhật hồ sơ";
      toastError("Lỗi", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle password change
  const handleChangePassword = async (values: any) => {
    if (values.newPassword !== values.confirmPassword) {
      toastError("Lỗi", "Mật khẩu không trùng khớp");
      return;
    }

    try {
      setLoading(true);
      await userAccountService.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        confirmNewPassword: values.confirmPassword,
      });
      toastSuccess("Thành công", "Thay đổi mật khẩu thành công");
      setChangePasswordVisible(false);
      changePasswordForm.resetFields();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Không thể thay đổi mật khẩu";
      toastError("Lỗi", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle email change initiate
  const handleInitiateEmailChange = async (values: any) => {
    try {
      setLoading(true);
      await userAccountService.initiateEmailUpdate({
        newEmail: values.newEmail,
        currentPassword: values.currentPassword,
      });
      toastSuccess("Thành công", "Mã OTP đã được gửi tới email mới của bạn");
      setChangeEmailVisible(false);
      changeEmailForm.resetFields();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Không thể gửi mã OTP";
      toastError("Lỗi", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    Modal.confirm({
      title: "Đăng xuất",
      content: "Bạn có chắc chắn muốn đăng xuất?",
      okText: "Đăng xuất",
      cancelText: "Hủy",
      okButtonProps: { danger: true },
      onOk() {
        logout();
        navigate("/login");
        toastSuccess("Thành công", "Đã đăng xuất");
      },
    });
  };

  if (loading && !userData) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-gray-600 font-semibold">
            Đang tải thông tin hồ sơ...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header Section */}
      <div className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-3 leading-tight">
            Hồ sơ của tôi
          </h1>
          <p className="text-xl text-gray-600">
            Quản lý thông tin cá nhân và bảo mật tài khoản
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Avatar Card - Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-shadow space-y-6 sticky top-24">
              {/* Avatar */}
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar"
                      className="w-32 h-32 rounded-full object-cover border-4 border-[#FF8F50] shadow-lg"
                    />
                  ) : (
                    <Avatar
                      size={128}
                      icon={<UserOutlined />}
                      className="border-4 border-[#FF8F50]"
                      style={{ fontSize: "3rem", backgroundColor: "#f5f5f5" }}
                    />
                  )}

                  <label className="absolute bottom-0 right-0 cursor-pointer">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#FF8F50] to-[#ffb74d] rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transform hover:scale-110 transition-all">
                      <EditOutlined className="text-lg" />
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      style={{ display: "none" }}
                    />
                  </label>
                </div>

                {uploadingAvatar && (
                  <div className="text-center">
                    <Spin size="small" />
                    <p className="text-sm text-gray-600 mt-2">Đang upload...</p>
                  </div>
                )}
              </div>

              {/* User Info Quick */}
              <div className="text-center pt-6 border-t border-gray-200 space-y-2">
                <h3 className="text-xl font-bold text-gray-900">{`${userData?.firstName} ${userData?.lastName}`}</h3>
                <p className="text-sm text-gray-600">{userData?.email}</p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Profile Information Section */}
            <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <UserOutlined className="text-[#FF8F50]" />
                Thông tin cá nhân
              </h2>

              {isEditingProfile ? (
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleUpdateProfile}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Form.Item
                      name="firstName"
                      label={
                        <span className="font-semibold text-gray-700">Tên</span>
                      }
                      rules={[{ required: true, message: "Vui lòng nhập tên" }]}
                    >
                      <Input
                        className="rounded-lg border-gray-300 py-2 px-3"
                        placeholder="Tên của bạn"
                      />
                    </Form.Item>

                    <Form.Item
                      name="lastName"
                      label={
                        <span className="font-semibold text-gray-700">Họ</span>
                      }
                      rules={[{ required: true, message: "Vui lòng nhập họ" }]}
                    >
                      <Input
                        className="rounded-lg border-gray-300 py-2 px-3"
                        placeholder="Họ của bạn"
                      />
                    </Form.Item>
                  </div>

                  <Form.Item
                    name="email"
                    label={
                      <span className="font-semibold text-gray-700">Email</span>
                    }
                    rules={[
                      { required: true, message: "Vui lòng nhập email" },
                      { type: "email", message: "Email không hợp lệ" },
                    ]}
                  >
                    <Input
                      disabled
                      className="rounded-lg border-gray-300 py-2 px-3"
                      placeholder="Email"
                    />
                  </Form.Item>

                  <Form.Item
                    name="phoneNumber"
                    label={
                      <span className="font-semibold text-gray-700">
                        Số điện thoại
                      </span>
                    }
                  >
                    <Input
                      className="rounded-lg border-gray-300 py-2 px-3"
                      placeholder="Số điện thoại"
                    />
                  </Form.Item>

                  <Form.Item
                    name="dateOfBirth"
                    label={
                      <span className="font-semibold text-gray-700">
                        Ngày sinh
                      </span>
                    }
                  >
                    <DatePicker
                      format="DD/MM/YYYY"
                      className="w-full rounded-lg border-gray-300"
                      placeholder="Chọn ngày sinh"
                    />
                  </Form.Item>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-[#FF8F50] to-[#ffb74d] hover:from-[#ffb74d] hover:to-[#FF8F50] text-white font-bold py-3 px-6 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      {loading ? "Đang lưu..." : "Lưu thay đổi"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingProfile(false);
                        form.resetFields();
                      }}
                      className="flex-1 bg-white text-gray-600 border-2 border-gray-200 font-bold py-3 px-6 rounded-full hover:border-[#FF8F50] hover:text-[#FF8F50] transition-all"
                    >
                      Hủy
                    </button>
                  </div>
                </Form>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl hover:bg-orange-50 transition-colors border border-gray-200">
                    <p className="text-xs text-gray-500 font-semibold mb-1">
                      TÊN
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      {userData?.firstName}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl hover:bg-orange-50 transition-colors border border-gray-200">
                    <p className="text-xs text-gray-500 font-semibold mb-1">
                      HỌ
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      {userData?.lastName}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl hover:bg-orange-50 transition-colors border border-gray-200">
                    <p className="text-xs text-gray-500 font-semibold mb-1">
                      EMAIL
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      {userData?.email}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl hover:bg-orange-50 transition-colors border border-gray-200">
                    <p className="text-xs text-gray-500 font-semibold mb-1">
                      SỐ ĐIỆN THOẠI
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      {userData?.phoneNumber || "Chưa cập nhật"}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl hover:bg-orange-50 transition-colors border border-gray-200">
                    <p className="text-xs text-gray-500 font-semibold mb-1">
                      NGÀY SINH
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      {userData?.dateOfBirth
                        ? dayjs(userData.dateOfBirth).format("DD/MM/YYYY")
                        : "Chưa cập nhật"}
                    </p>
                  </div>

                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="w-full bg-gradient-to-r from-[#FF8F50] to-[#ffb74d] hover:from-[#ffb74d] hover:to-[#FF8F50] text-white font-bold py-3 px-6 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 mt-2"
                  >
                    ✏️ Chỉnh sửa thông tin
                  </button>
                </div>
              )}
            </div>

            {/* Security Section */}
            <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <LockOutlined className="text-[#FF8F50]" />
                Bảo mật tài khoản
              </h2>

              <div className="space-y-4">
                {/* Password Change */}
                <div className="p-6 rounded-2xl border-2 border-gray-200 hover:border-[#FF8F50] transition-colors flex justify-between items-start">
                  <div className="flex gap-4 flex-1">
                    <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                      <LockOutlined className="text-[#FF8F50] text-lg" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">Mật khẩu</h3>
                      <p className="text-sm text-gray-600">
                        Thay đổi mật khẩu của bạn
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setChangePasswordVisible(true)}
                    className="bg-white text-gray-600 border-2 border-gray-200 font-bold py-2 px-6 rounded-full hover:border-[#FF8F50] hover:text-[#FF8F50] transition-all whitespace-nowrap ml-4"
                  >
                    Thay đổi
                  </button>
                </div>

                {/* Logout */}
                <div className="p-6 rounded-2xl border-2 border-red-200 bg-red-50 hover:border-red-500 transition-colors flex justify-between items-start">
                  <div className="flex gap-4 flex-1">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                      <LogoutOutlined className="text-red-600 text-lg" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">
                        Đăng xuất
                      </h3>
                      <p className="text-sm text-gray-600">
                        Đăng xuất khỏi tài khoản
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-full transition-all whitespace-nowrap ml-4 shadow-lg hover:shadow-xl"
                  >
                    Đăng xuất
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      <Modal
        title="Thay đổi mật khẩu"
        open={changePasswordVisible}
        onCancel={() => {
          setChangePasswordVisible(false);
          changePasswordForm.resetFields();
        }}
        footer={null}
        className="rounded-3xl"
      >
        <Form
          form={changePasswordForm}
          layout="vertical"
          onFinish={handleChangePassword}
          className="space-y-4"
        >
          <Form.Item
            name="currentPassword"
            label={
              <span className="font-semibold text-gray-700">
                Mật khẩu hiện tại
              </span>
            }
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu hiện tại" },
            ]}
          >
            <Input.Password
              className="rounded-lg"
              placeholder="Nhập mật khẩu hiện tại"
            />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label={
              <span className="font-semibold text-gray-700">Mật khẩu mới</span>
            }
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu mới" },
              { min: 6, message: "Mật khẩu phải ít nhất 6 ký tự" },
            ]}
          >
            <Input.Password
              className="rounded-lg"
              placeholder="Nhập mật khẩu mới"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label={
              <span className="font-semibold text-gray-700">
                Xác nhận mật khẩu
              </span>
            }
            rules={[{ required: true, message: "Vui lòng xác nhận mật khẩu" }]}
          >
            <Input.Password
              className="rounded-lg"
              placeholder="Xác nhận mật khẩu"
            />
          </Form.Item>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#FF8F50] to-[#ffb74d] hover:from-[#ffb74d] hover:to-[#FF8F50] text-white font-bold py-3 px-6 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 mt-6"
          >
            {loading ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
          </button>
        </Form>
      </Modal>

      {/* Change Email Modal */}
      <Modal
        title="Thay đổi email"
        open={changeEmailVisible}
        onCancel={() => {
          setChangeEmailVisible(false);
          changeEmailForm.resetFields();
        }}
        footer={null}
        className="rounded-3xl"
      >
        <Form
          form={changeEmailForm}
          layout="vertical"
          onFinish={handleInitiateEmailChange}
          className="space-y-4"
        >
          <p className="text-gray-600 text-sm mb-4">
            Chúng tôi sẽ gửi mã OTP tới email mới của bạn để xác minh
          </p>

          <Form.Item
            name="newEmail"
            label={
              <span className="font-semibold text-gray-700">Email mới</span>
            }
            rules={[
              { required: true, message: "Vui lòng nhập email mới" },
              { type: "email", message: "Email không hợp lệ" },
            ]}
          >
            <Input className="rounded-lg" placeholder="Nhập email mới" />
          </Form.Item>

          <Form.Item
            name="currentPassword"
            label={
              <span className="font-semibold text-gray-700">
                Mật khẩu hiện tại
              </span>
            }
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
          >
            <Input.Password
              className="rounded-lg"
              placeholder="Nhập mật khẩu hiện tại"
            />
          </Form.Item>

          <p className="text-gray-500 text-xs italic">
            * Sau khi xác nhận, email của bạn sẽ được thay đổi
          </p>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#FF8F50] to-[#ffb74d] hover:from-[#ffb74d] hover:to-[#FF8F50] text-white font-bold py-3 px-6 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 mt-6"
          >
            {loading ? "Đang gửi..." : "Gửi mã xác minh"}
          </button>
        </Form>
      </Modal>
    </div>
  );
};

export default MyProfile;
