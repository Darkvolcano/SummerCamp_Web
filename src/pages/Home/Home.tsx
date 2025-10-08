import { Button, Card, Avatar, Dropdown, message } from 'antd';
import { UserOutlined, LogoutOutlined, SettingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../services/userService';
import { PagePath } from '../../enums/page-path.enum';
import type { MenuProps } from 'antd';

const Home = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();

    const handleLogout = () => {
        logout();
        message.success('Đăng xuất thành công!');
        navigate(PagePath.LOGIN);
    };

    const menuItems: MenuProps['items'] = [
        {
            key: 'profile',
            label: 'Thông tin cá nhân',
            icon: <UserOutlined />,
            onClick: () => {
                message.info('Chức năng đang được phát triển');
            }
        },
        {
            key: 'settings',
            label: 'Cài đặt',
            icon: <SettingOutlined />,
            onClick: () => {
                message.info('Chức năng đang được phát triển');
            }
        },
        {
            type: 'divider',
        },
        {
            key: 'logout',
            label: 'Đăng xuất',
            icon: <LogoutOutlined />,
            danger: true,
            onClick: handleLogout,
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-orange-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <h1 className="text-2xl font-bold text-orange-600">
                                Camp Ease
                            </h1>
                        </div>

                        <div className="flex items-center gap-4">
                            <span className="text-gray-700 font-medium">
                                Xin chào, {user?.fullName || 'User'}
                            </span>
                            <Dropdown menu={{ items: menuItems }} placement="bottomRight" arrow>
                                <Avatar
                                    size="large"
                                    icon={<UserOutlined />}
                                    className="cursor-pointer bg-orange-500 hover:bg-orange-600 transition-colors"
                                />
                            </Dropdown>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Welcome Section */}
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">
                        Chào mừng đến với Camp Ease! 🏕️
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Hệ thống quản lý trại hè toàn diện, giúp bạn tổ chức và quản lý các hoạt động trại hè một cách dễ dàng và hiệu quả.
                    </p>
                </div>

                {/* User Info Card */}
                <Card
                    className="mb-8 shadow-lg border-orange-200"
                    style={{ borderRadius: '16px' }}
                >
                    <div className="flex items-center gap-6">
                        <Avatar
                            size={80}
                            icon={<UserOutlined />}
                            className="bg-gradient-to-br from-orange-400 to-orange-600"
                        />
                        <div className="flex-1">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                {user?.fullName || 'Người dùng'}
                            </h3>
                            <div className="space-y-1">
                                <p className="text-gray-600">
                                    <span className="font-semibold">Email:</span> {user?.email || 'N/A'}
                                </p>
                                <p className="text-gray-600">
                                    <span className="font-semibold">Số điện thoại:</span> {user?.phone_number || 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    <Card
                        hoverable
                        className="shadow-md border-orange-100 hover:border-orange-300 transition-all"
                        style={{ borderRadius: '12px' }}
                        onClick={() => message.info('Chức năng đang được phát triển')}
                    >
                        <div className="text-center">
                            <div className="text-5xl mb-4">🏕️</div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                Quản lý Trại hè
                            </h3>
                            <p className="text-gray-600">
                                Tạo và quản lý các chương trình trại hè
                            </p>
                        </div>
                    </Card>

                    <Card
                        hoverable
                        className="shadow-md border-orange-100 hover:border-orange-300 transition-all"
                        style={{ borderRadius: '12px' }}
                        onClick={() => message.info('Chức năng đang được phát triển')}
                    >
                        <div className="text-center">
                            <div className="text-5xl mb-4">👥</div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                Quản lý Học viên
                            </h3>
                            <p className="text-gray-600">
                                Theo dõi thông tin và tiến độ học viên
                            </p>
                        </div>
                    </Card>

                    <Card
                        hoverable
                        className="shadow-md border-orange-100 hover:border-orange-300 transition-all"
                        style={{ borderRadius: '12px' }}
                        onClick={() => message.info('Chức năng đang được phát triển')}
                    >
                        <div className="text-center">
                            <div className="text-5xl mb-4">📅</div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                Lịch trình
                            </h3>
                            <p className="text-gray-600">
                                Xem và quản lý lịch trình hoạt động
                            </p>
                        </div>
                    </Card>

                    <Card
                        hoverable
                        className="shadow-md border-orange-100 hover:border-orange-300 transition-all"
                        style={{ borderRadius: '12px' }}
                        onClick={() => message.info('Chức năng đang được phát triển')}
                    >
                        <div className="text-center">
                            <div className="text-5xl mb-4">💰</div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                Thanh toán
                            </h3>
                            <p className="text-gray-600">
                                Quản lý thanh toán và giao dịch
                            </p>
                        </div>
                    </Card>

                    <Card
                        hoverable
                        className="shadow-md border-orange-100 hover:border-orange-300 transition-all"
                        style={{ borderRadius: '12px' }}
                        onClick={() => message.info('Chức năng đang được phát triển')}
                    >
                        <div className="text-center">
                            <div className="text-5xl mb-4">📊</div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                Báo cáo
                            </h3>
                            <p className="text-gray-600">
                                Xem báo cáo và thống kê chi tiết
                            </p>
                        </div>
                    </Card>

                    <Card
                        hoverable
                        className="shadow-md border-orange-100 hover:border-orange-300 transition-all"
                        style={{ borderRadius: '12px' }}
                        onClick={() => message.info('Chức năng đang được phát triển')}
                    >
                        <div className="text-center">
                            <div className="text-5xl mb-4">⚙️</div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                Cài đặt
                            </h3>
                            <p className="text-gray-600">
                                Tùy chỉnh hệ thống theo nhu cầu
                            </p>
                        </div>
                    </Card>
                </div>

                {/* Quick Actions */}
                <Card
                    title={<span className="text-xl font-bold">Thao tác nhanh</span>}
                    className="shadow-lg border-orange-200"
                    style={{ borderRadius: '16px' }}
                >
                    <div className="flex flex-wrap gap-4">
                        <Button
                            type="primary"
                            size="large"
                            className="bg-orange-500 hover:bg-orange-600 border-orange-500"
                            onClick={() => message.info('Chức năng đang được phát triển')}
                        >
                            Tạo trại hè mới
                        </Button>
                        <Button
                            size="large"
                            onClick={() => message.info('Chức năng đang được phát triển')}
                        >
                            Xem danh sách trại hè
                        </Button>
                        <Button
                            size="large"
                            onClick={() => message.info('Chức năng đang được phát triển')}
                        >
                            Quản lý đăng ký
                        </Button>
                        <Button
                            size="large"
                            onClick={() => message.info('Chức năng đang được phát triển')}
                        >
                            Xem báo cáo
                        </Button>
                    </div>
                </Card>
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-orange-100 mt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="text-center text-gray-600">
                        <p>© 2025 Camp Ease. All rights reserved.</p>
                        <p className="text-sm mt-2">Hệ thống quản lý trại hè chuyên nghiệp</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;