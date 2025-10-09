import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Edit2, Save, X, LogOut } from 'lucide-react';
import { useAuthStore } from '../../services/userService';
import { PagePath } from '../../enums/page-path.enum';
import { message } from 'antd';
import './UserProfile.css';

const UserProfile = () => {
    const { user, logout, setUser } = useAuthStore();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [editedUser, setEditedUser] = useState(user);

    if (!user) {
        navigate(PagePath.LOGIN);
        return null;
    }

    const handleSave = () => {
        if (editedUser) {
            setUser(editedUser);
            message.success('Cập nhật thông tin thành công!');
            setIsEditing(false);
        }
    };

    const handleCancel = () => {
        setEditedUser(user);
        setIsEditing(false);
    };

    const handleLogout = () => {
        logout();
        navigate(PagePath.ROOT);
        message.success('Đăng xuất thành công!');
    };

    return (
        <div className="profile-page-wrapper">
            {/* Animated Background */}
            <div className="profile-background">
                <div className="floating-shapes">
                    <div className="shape shape-1"></div>
                    <div className="shape shape-2"></div>
                    <div className="shape shape-3"></div>
                    <div className="shape shape-4"></div>
                    <div className="shape shape-5"></div>
                </div>
            </div>

            {/* Main Content */}
            <div className="profile-container">
                <div className="profile-card">
                    {/* Header */}
                    <div className="profile-header">
                        <div className="profile-avatar">
                            <User size={64} />
                        </div>
                        <h1 className="profile-title">Thông tin cá nhân</h1>
                        <p className="profile-subtitle">Quản lý thông tin tài khoản của bạn</p>
                    </div>

                    {/* User Info */}
                    <div className="profile-content">
                        {/* Full Name */}
                        <div className="info-group">
                            <label className="info-label">
                                <User size={18} />
                                <span>Họ và tên</span>
                            </label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editedUser?.fullName || ''}
                                    onChange={(e) => setEditedUser({ ...editedUser!, fullName: e.target.value })}
                                    className="info-input"
                                    placeholder="Nhập họ và tên"
                                />
                            ) : (
                                <div className="info-value">{user.fullName}</div>
                            )}
                        </div>

                        {/* Email */}
                        <div className="info-group">
                            <label className="info-label">
                                <Mail size={18} />
                                <span>Email</span>
                            </label>
                            <div className="info-value">{user.email}</div>
                            <p className="info-note">Email không thể thay đổi</p>
                        </div>

                        {/* Phone */}
                        <div className="info-group">
                            <label className="info-label">
                                <Phone size={18} />
                                <span>Số điện thoại</span>
                            </label>
                            {isEditing ? (
                                <input
                                    type="tel"
                                    value={editedUser?.phone_number || ''}
                                    onChange={(e) => setEditedUser({ ...editedUser!, phone_number: e.target.value })}
                                    className="info-input"
                                    placeholder="Nhập số điện thoại"
                                />
                            ) : (
                                <div className="info-value">{user.phone_number || 'Chưa cập nhật'}</div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="profile-actions">
                            {isEditing ? (
                                <>
                                    <button onClick={handleSave} className="btn-save">
                                        <Save size={18} />
                                        <span>Lưu thay đổi</span>
                                    </button>
                                    <button onClick={handleCancel} className="btn-cancel">
                                        <X size={18} />
                                        <span>Hủy</span>
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button onClick={() => setIsEditing(true)} className="btn-edit">
                                        <Edit2 size={18} />
                                        <span>Chỉnh sửa</span>
                                    </button>
                                    <button onClick={handleLogout} className="btn-logout">
                                        <LogOut size={18} />
                                        <span>Đăng xuất</span>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="profile-footer">
                        <button onClick={() => navigate(PagePath.ROOT)} className="back-link">
                            ← Quay lại trang chủ
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
