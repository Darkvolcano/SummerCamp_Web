import { Input, Button, message, Form, Checkbox, DatePicker } from "antd";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { UserOutlined, MailOutlined, LockOutlined, CalendarOutlined } from "@ant-design/icons";
import loginBackground from '../../assets/login-background.png';
import { PagePath } from '../../enums/page-path.enum';

const Register = () => {
  const [registerForm] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isSliding, setIsSliding] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setIsVisible(true);
    }, 50);
  }, []);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      // TODO: Implement your register API call here
      console.log("Registration data:", values);

      await new Promise(resolve => setTimeout(resolve, 1000));

      message.success("Đăng ký thành công! Vui lòng kiểm tra email để nhập mã OTP.");

      setIsSliding(true);
      setTimeout(() => {
        // Navigate to OTP verification with email
        navigate(PagePath.VERIFY_OTP, { state: { email: values.email } });
      }, 600);
    } catch (error) {
      message.error("Đăng ký thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setIsSliding(true);
    setTimeout(() => {
      navigate(PagePath.LOGIN);
    }, 600);
  };

  return (
    <div
      className="fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-cover bg-center bg-no-repeat overflow-hidden z-50"
      style={{
        backgroundImage: `url(${loginBackground})`,
        margin: 0,
        padding: 0,
        width: '100vw',
        height: '100vh',
      }}
    >
      <div
        className="relative z-10"
        style={{
          width: '450px',
          maxHeight: '90vh',
          transform: isSliding ? 'translateX(150%)' : (isVisible ? 'translateX(0)' : 'translateX(150%)'),
          opacity: isSliding ? 0 : (isVisible ? 1 : 0),
          transition: 'transform 0.6s ease-out, opacity 0.6s ease-out',
        }}
      >
        <div className="w-full h-full flex flex-col p-8 shadow-2xl overflow-y-auto" style={{
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          borderRadius: '25px',
          maxHeight: '90vh'
        }}>
          <h1 className="text-2xl font-bold text-center mb-2" style={{ color: '#ec6426' }}>
            ĐĂNG KÝ
          </h1>
          <p className="text-center mb-6 text-sm" style={{ color: '#632713' }}>
            Tạo tài khoản mới để bắt đầu
          </p>

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
                  style={{
                    height: '40px',
                    borderRadius: '20px',
                    border: '2px solid #d9d9d9',
                    fontFamily: 'inherit'
                  }}
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
                  style={{
                    height: '40px',
                    borderRadius: '20px',
                    border: '2px solid #d9d9d9',
                    fontFamily: 'inherit'
                  }}
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
                style={{
                  width: '100%',
                  height: '40px',
                  borderRadius: '20px',
                  border: '2px solid #d9d9d9'
                }}
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
                style={{
                  height: '40px',
                  borderRadius: '20px',
                  border: '2px solid #d9d9d9',
                  fontFamily: 'inherit'
                }}
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
                style={{
                  height: '40px',
                  borderRadius: '20px',
                  border: '2px solid #d9d9d9',
                  fontFamily: 'inherit'
                }}
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
                style={{
                  height: '40px',
                  borderRadius: '20px',
                  border: '2px solid #d9d9d9',
                  fontFamily: 'inherit'
                }}
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
              <Checkbox>
                <span style={{ fontSize: '12px', color: '#632713' }}>
                  Tôi đồng ý với{' '}
                  <span style={{ color: '#f97316', fontWeight: 600 }}>
                    Điều khoản dịch vụ
                  </span>
                  {' '}và{' '}
                  <span style={{ color: '#f97316', fontWeight: 600 }}>
                    Chính sách bảo mật
                  </span>
                </span>
              </Checkbox>
            </Form.Item>

            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                htmlType="submit"
                loading={loading}
                style={{
                  width: '100%',
                  background: '#f97316',
                  border: 'none',
                  height: '40px',
                  borderRadius: '20px',
                  color: '#fff',
                  fontWeight: 'bold',
                  fontSize: '16px'
                }}
              >
                {loading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
              </Button>
            </Form.Item>
          </Form>

          <div style={{ marginTop: 20, textAlign: 'center' }}>
            <button
              onClick={handleBackToLogin}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                color: '#78a243',
                fontSize: '14px',
                textDecoration: 'underline',
                cursor: 'pointer'
              }}
            >
              Đã có tài khoản? Đăng nhập
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;