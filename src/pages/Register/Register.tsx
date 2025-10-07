import { Input, Button, message, Form, Checkbox, DatePicker } from "antd";
import "./Register.css";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { UserOutlined, MailOutlined, LockOutlined, CalendarOutlined } from "@ant-design/icons";

const Register = () => {
  const [registerForm] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      // TODO: Implement your register API call here
      console.log("Registration data:", values);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      message.success("Đăng ký thành công! Vui lòng kiểm tra email để kích hoạt tài khoản.");
      navigate("/login");
    } catch (error) {
      message.error("Đăng ký thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="image-section">
        {/* Background image will be set via CSS */}
      </div>
      <div className="form-section">
        <div className="form-content">
          <h1 className="title">ĐĂNG KÝ</h1>
          <p className="subtitle">Tạo tài khoản mới để bắt đầu</p>

          <Form
            form={registerForm}
            name="register"
            onFinish={onFinish}
            layout="vertical"
          >
            <div style={{ display: 'flex', gap: '10px' }}>
              <Form.Item
                name="firstName"
                style={{ marginBottom: 10, flex: 1 }}
                rules={[
                  { required: true, message: "Nhập tên" },
                  { min: 2, message: "Tên phải có ít nhất 2 ký tự" }
                ]}
              >
                <Input
                  placeholder="Tên"
                  className="input-field"
                  prefix={<UserOutlined style={{ color: '#da7339' }} />}
                />
              </Form.Item>

              <Form.Item
                name="lastName"
                style={{ marginBottom: 10, flex: 1 }}
                rules={[
                  { required: true, message: "Nhập họ" },
                  { min: 2, message: "Họ phải có ít nhất 2 ký tự" }
                ]}
              >
                <Input
                  placeholder="Họ"
                  className="input-field"
                  prefix={<UserOutlined style={{ color: '#da7339' }} />}
                />
              </Form.Item>
            </div>

            <Form.Item
              name="dateOfBirth"
              style={{ marginBottom: 10 }}
              rules={[
                { required: true, message: "Chọn ngày sinh" },
                {
                  validator: (_, value) => {
                    if (!value) return Promise.resolve();
                    const age = new Date().getFullYear() - value.year();
                    if (age < 18) {
                      return Promise.reject("Bạn phải ít nhất 18 tuổi");
                    }
                    return Promise.resolve();
                  }
                }
              ]}
            >
              <DatePicker
                placeholder="Ngày sinh"
                className="input-field date-picker"
                style={{ width: '100%' }}
                format="DD/MM/YYYY"
                suffixIcon={<CalendarOutlined style={{ color: '#da7339' }} />}
              />
            </Form.Item>

            <Form.Item
              name="email"
              style={{ marginBottom: 10 }}
              rules={[
                { required: true, message: "Nhập email" },
                { type: 'email', message: "Email không hợp lệ" }
              ]}
            >
              <Input
                placeholder="Email"
                className="input-field"
                prefix={<MailOutlined style={{ color: '#da7339' }} />}
              />
            </Form.Item>

            <Form.Item
              name="password"
              style={{ marginBottom: 10 }}
              rules={[
                { required: true, message: "Nhập mật khẩu" },
                { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" }
              ]}
            >
              <Input.Password
                placeholder="Mật khẩu"
                className="input-field"
                prefix={<LockOutlined style={{ color: '#da7339' }} />}
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              style={{ marginBottom: 10 }}
              dependencies={['password']}
              rules={[
                { required: true, message: "Xác nhận mật khẩu" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Mật khẩu không khớp'));
                  },
                }),
              ]}
            >
              <Input.Password
                placeholder="Xác nhận mật khẩu"
                className="input-field"
                prefix={<LockOutlined style={{ color: '#da7339' }} />}
              />
            </Form.Item>

            <Form.Item
              name="acceptTerms"
              valuePropName="checked"
              style={{ marginBottom: 20 }}
              rules={[
                {
                  validator: (_, value) =>
                    value ? Promise.resolve() : Promise.reject(new Error('Bạn phải chấp nhận điều khoản')),
                },
              ]}
            >
              <Checkbox className="terms-checkbox">
                <span style={{ fontSize: '12px', color: '#632713' }}>
                  Tôi đồng ý với{' '}
                  <Link to="/terms-of-service" style={{ color: '#f97316', fontWeight: 600 }}>
                    Điều khoản dịch vụ
                  </Link>
                  {' '}và{' '}
                  <Link to="/privacy-policy" style={{ color: '#f97316', fontWeight: 600 }}>
                    Chính sách bảo mật
                  </Link>
                </span>
              </Checkbox>
            </Form.Item>

            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                className="register-button"
                htmlType="submit"
                loading={loading}
              >
                {loading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
              </Button>
            </Form.Item>
          </Form>

          <div className="divider" style={{ marginTop: 20 }}>
            <span className="divider-text">
              <Link to="/login">Đã có tài khoản? Đăng nhập</Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;