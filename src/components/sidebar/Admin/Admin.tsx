import { useState } from "react";
import { Layout, Menu, Button, Avatar, Dropdown, message } from "antd";
import type { MenuProps } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  BarChartOutlined,
  LogoutOutlined,
  DownOutlined,
  ShoppingFilled,
  TagOutlined,
  ShoppingOutlined,
  MessageOutlined,
  CreditCardOutlined,
} from "@ant-design/icons";
import "./Admin.css";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
// import logo from "../../assets/logo-footer.png";
import { useAuthStore } from "../../../services/userService";
import { MessageCircle, Scroll } from "lucide-react";

const { Header, Sider, Content } = Layout;

const AdminSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user: authUser, logout } = useAuthStore();

  const siderWidth = 240;
  const siderCollapsedWidth = 80;

  const menuItems = [
    {
      key: "/manager/dashboard",
      icon: <BarChartOutlined />,
      label: "Tổng quan",
    },
    {
      key: "/manager/transactions",
      icon: <CreditCardOutlined />,
      label: "Quản lý giao dịch",
    },
    {
      key: "/manager/orders",
      icon: <ShoppingFilled />,
      label: "Quản lý đơn đăng ký",
    },

    {
      key: "/manager/products",
      icon: <ShoppingOutlined />,
      label: "Quản lý trại hè",
    },
    {
      key: "/manager/promotions",
      icon: <TagOutlined />,
      label: "Quản lý khuyến mãi",
    },
    {
      key: "/manager/feedback",
      icon: <MessageOutlined />,
      label: "Quản lý sự cố",
    },
    {
      key: "/manager/staffs",
      icon: <UserOutlined />,
      label: "Quản lý nhân viên",
    },
    {
      key: "/manager/blog",
      icon: <Scroll />,
      label: "Quản lý blog",
    },
    {
      key: "/manager/chat",
      icon: <MessageCircle />,
      label: "Chat",
    },
  ];

  const userMenuItems: MenuProps["items"] = [
    {
      key: "/manager/profile",
      label: "Thông tin cá nhân",
      icon: <UserOutlined />,
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
        message.success("Đăng xuất thành công");
        navigate("/login");
      },
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        width={siderWidth}
        collapsedWidth={siderCollapsedWidth}
        style={{
          backgroundColor: "#D97B41",
          boxShadow: "2px 0 8px rgba(0, 0, 0, 0.1)",
          position: "fixed",
          height: "100vh",
          left: 0,
          top: 0,
          zIndex: 1000,
          overflowY: "auto",
        }}
        className="aside-sidebar"
      >
        <div
          className="logo"
          style={{
            padding: "24px 16px",
            textAlign: "center",
            borderBottom: "1px solid #E9C97B",
            marginBottom: "8px",
            background: "#D97B41",
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
            {/* <img
              src={logo}
              alt="logo"
              style={{
                maxHeight: "100%",
                maxWidth: "100%",
                objectFit: "contain",
                transition: "all 0.3s",
              }}
            /> */}
          </h2>
        </div>
        <Menu
          className="manager-menu"
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultOpenKeys={["orders", "revenue"]}
          onClick={({ key }) => navigate(key)}
          items={menuItems}
          style={{
            borderRight: 0,
            backgroundColor: "#D97B41",
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
            background: "#FFF3D6",
            display: "flex",
            alignItems: "center",
            padding: "0 24px",
            borderBottom: "1px solid #E9C97B",
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
            style={{
              fontSize: "16px",
              width: 64,
              height: 64,
              color: "#D97B41",
              outline: "none",
              border: "none",
              background: "transparent",
              position: "absolute",
              left: collapsed ? "-10px" : "15px",
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
                  e.currentTarget.style.backgroundColor = "#E9C97B";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <Avatar
                  icon={<UserOutlined />}
                  style={{
                    backgroundColor: "#A05A2C",
                    color: "#fff",
                  }}
                />
                <span style={{ color: "#A05A2C", fontWeight: 600 }}>
                  {authUser?.fullName}
                </span>
                <DownOutlined style={{ color: "#A05A2C" }} />
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content
          style={{
            background: "#FFF3D6",
            minHeight: 280,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminSidebar;
