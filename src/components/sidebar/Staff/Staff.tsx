import { useState } from "react";
import {
  Layout,
  Menu,
  Button,
  Avatar,
  Dropdown,
  message,
  Badge,
  List,
  Typography,
} from "antd";
import type { MenuProps } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  ShoppingFilled,
  LogoutOutlined,
  BellOutlined,
  DownOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import "./Staff.css";
import logo from "../../assets/logo-footer.png";
import { useAuthStore } from "../../../services/userService";
import {
  useGetNotifications,
  type Notification,
} from "../../../services/notificationService";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { MessageCircle } from "lucide-react";
dayjs.extend(relativeTime);

const { Header, Sider, Content } = Layout;

const StaffSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { data: notifications, isLoading: notificationsLoading } =
    useGetNotifications();

  const siderWidth = 250;
  const siderCollapsedWidth = 80;

  const menuItems = [
    {
      key: "/staff/orders",
      icon: <ShoppingFilled style={{ width: "19px", fontSize: 19 }} />,
      label: "Quản lý đơn hàng",
    },
    {
      key: "/staff/pos",
      icon: <ShoppingCartOutlined style={{ width: "19px" }} />,
      label: "POS/Bán hàng",
    },
    {
      key: "/staff/chat",
      icon: <MessageCircle />,
      label: "Chat",
    },
  ];

  const userMenuItems: MenuProps["items"] = [
    {
      key: "profile",
      label: "Thông tin cá nhân",
      icon: <UserOutlined />,
      onClick: () => {
        navigate("/staff/profile");
      },
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      label: "Đăng xuất",
      icon: <LogoutOutlined />,
      onClick: () => {
        logout();
        navigate("/login");
        message.success("Đăng xuất thành công");
      },
    },
  ];

  const notificationOverlay = (
    <div
      style={{
        backgroundColor: "white",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        borderRadius: "8px",
        width: "360px",
        maxHeight: "450px",
        display: "flex",
        flexDirection: "column",
        border: "1px solid #fde68a",
      }}
    >
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid #fde68a",
          fontWeight: "bold",
          fontSize: "16px",
          color: "#92400e",
        }}
      >
        Notifications
      </div>
      <List
        loading={notificationsLoading}
        dataSource={notifications}
        style={{ overflowY: "auto", flex: 1 }}
        locale={{
          emptyText: (
            <div style={{ padding: "20px", textAlign: "center" }}>
              No new notifications
            </div>
          ),
        }}
        renderItem={(item: Notification) => (
          <List.Item
            style={{ padding: "12px 16px", borderBottom: "1px solid #fde68a" }}
          >
            <List.Item.Meta
              title={<Typography.Text strong>{item.title}</Typography.Text>}
              description={
                <>
                  <Typography.Text>{item.message}</Typography.Text>
                  <br />
                  <Typography.Text
                    type="secondary"
                    style={{ fontSize: "12px" }}
                  >
                    {dayjs(item.createdAt).fromNow()}
                  </Typography.Text>
                </>
              }
            />
          </List.Item>
        )}
      />
    </div>
  );

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        width={siderWidth}
        collapsedWidth={siderCollapsedWidth}
        style={{
          backgroundColor: "#92400e",
          boxShadow: "2px 0 8px rgba(0, 0, 0, 0.1)",
          position: "fixed",
          height: "100vh",
          left: 0,
          top: 0,
          zIndex: 1000,
          overflowY: "auto",
        }}
        className="staff-sidebar"
      >
        <div
          className="logo"
          style={{
            padding: "24px 16px",
            textAlign: "center",
            borderBottom: "1px solid #fde68a",
            marginBottom: "8px",
            background: "#92400e",
            width: "100%",
          }}
        >
          <h2
            style={{
              color: "#fff",
              margin: 0,
              fontSize: collapsed ? "20px" : "24px",
              fontWeight: "bold",
              transition: "all 0.3s",
              letterSpacing: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "60px",
            }}
          >
            <img
              src={logo}
              alt="logo"
              style={{
                maxHeight: "100%",
                maxWidth: collapsed ? "90%" : "70%",
                objectFit: "contain",
                transition: "all 0.3s",
              }}
            />
          </h2>
        </div>
        <Menu
          className="admin-menu"
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultOpenKeys={["stores"]}
          onClick={({ key }) => navigate(key)}
          items={menuItems}
          style={{
            borderRight: 0,
            backgroundColor: "#92400e",
          }}
        />
      </Sider>

      <Layout
        style={{
          marginLeft: collapsed ? siderCollapsedWidth : siderWidth,
          transition: "margin-left 0.2s",
          minHeight: "100vh",
        }}
      >
        <Header
          style={{
            background: "#E0E7FF",
            display: "flex",
            alignItems: "center",
            padding: "0 24px",
            borderBottom: "1px solid #fde68a",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
            position: "sticky",
            top: 0,
            zIndex: 999,
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="staff-sidebar-toggle-btn"
            style={{
              fontSize: "16px",
              width: 64,
              height: 64,
              outline: "none",
              border: "none",
              background: "transparent",
              position: "absolute",
              left: collapsed ? "-10px" : "10px",
              top: "50%",
              transform: "translateY(-50%)",
            }}
          />

          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: 24,
            }}
          >
            <Dropdown
              overlay={notificationOverlay}
              trigger={["click"]}
              placement="bottomRight"
            >
              <a onClick={(e) => e.preventDefault()}>
                <Badge count={notifications?.length || 0}>
                  <BellOutlined
                    className="admin-bell-btn"
                    style={{ fontSize: "20px", color: "#d97706" }}
                  />
                </Badge>
              </a>
            </Dropdown>

            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              arrow
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  cursor: "pointer",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  transition: "all 0.3s",
                  backgroundColor: "transparent",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#fde68a";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <Avatar
                  icon={<UserOutlined />}
                  style={{
                    backgroundColor: "#d97706",
                    color: "#fff",
                  }}
                />
                <span style={{ color: "#92400e", fontWeight: 600 }}>
                  {user?.fullName}
                </span>
                <DownOutlined style={{ color: "#92400e" }} />
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content
          style={{
            background: "#E0E7FF",
            minHeight: 280,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default StaffSidebar;
