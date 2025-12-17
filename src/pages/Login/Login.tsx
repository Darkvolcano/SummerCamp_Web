import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Loader2,
  ArrowRight,
  Home,
} from "lucide-react";
import { PagePath } from "../../enums/page-path.enum";
import { useAuthStore } from "../../services/userService";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSliding, setIsSliding] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loginError, setLoginError] = useState("");
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError("Email là bắt buộc");
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError("Email không hợp lệ");
      return false;
    }
    setEmailError("");
    return true;
  };

  const validatePassword = (password: string) => {
    if (!password) {
      setPasswordError("Mật khẩu là bắt buộc");
      return false;
    }
    if (password.length < 6) {
      setPasswordError("Mật khẩu phải có ít nhất 6 ký tự");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous login error
    setLoginError("");

    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) return;

    setLoading(true);
    try {
      const result = await login({ email, password }, rememberMe);

      if (result.success) {
        message.success("Đăng nhập thành công!");

        // Get user data from localStorage to check role
        const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
        const storedToken = localStorage.getItem("token") || sessionStorage.getItem("token");

        if (storedToken && storedUser) {
          const { jwtDecode } = await import("jwt-decode");
          const decoded = jwtDecode<{ role: string }>(storedToken);
          const userRole = decoded.role?.toLowerCase();

          // Redirect based on user role (case-insensitive)
          setTimeout(() => {
            if (userRole === "admin") {
              navigate(PagePath.ADMIN_DASHBOARD);
            } else if (userRole === "staff") {
              navigate(PagePath.STAFF_CALENDAR);
            } else if (userRole === "manager") {
              navigate(PagePath.MANAGER_DASHBOARD);
            } else if (userRole === "driver") {
              navigate(PagePath.DRIVER_CALENDAR);
            } else {
              navigate(PagePath.HOME);
            }
          }, 500);
        } else {
          // Fallback to home if no token found
          setTimeout(() => {
            navigate(PagePath.HOME);
          }, 500);
        }
      } else {
        // Handle failed login
        const errorMsg = result.message || "Đăng nhập thất bại";
        setLoginError(errorMsg);
      }
    } catch (error: any) {
      // Handle wrong credentials
      let errorMessage = "Đăng nhập thất bại. Vui lòng thử lại.";

      if (error?.responseValue?.message) {
        errorMessage = error.responseValue.message;
      } else if (error?.responseValue?.code === "INVALID_CREDENTIALS") {
        errorMessage = "Email hoặc mật khẩu không chính xác!";
      } else if (error?.responseValue?.code === "ACCOUNT_NOT_ACTIVE") {
        errorMessage = "Tài khoản chưa được kích hoạt. Vui lòng kiểm tra email.";
      }

      setLoginError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setIsSliding(true);
    setTimeout(() => {
      navigate(PagePath.FORGOT_PASSWORD);
    }, 600);
  };

  const handleSignUp = () => {
    setIsSliding(true);
    setTimeout(() => {
      navigate(PagePath.REGISTER);
    }, 600);
  };

  const handleGoHome = () => {
    console.log("🏠 [Login] Home button clicked, starting slide animation");
    setIsSliding(true);
    setTimeout(() => {
      console.log("🏠 [Login] Navigating to root: /");
      navigate("/");
    }, 600);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <div className="login-page-wrapper">
      {/* Animated Background with Floating Shapes */}
      <div className="login-background">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
          <div className="shape shape-5"></div>
        </div>
      </div>

      {/* Split Screen Container */}
      <div
        className={`login-split-container ${isSliding ? "slide-out-left" : isVisible ? "slide-in" : ""
          }`}
      >
        {/* Left Side - Hero Section */}
        <div className="login-hero-section">
          <div className="hero-content">
            <button
              type="button"
              className="hero-home-button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleGoHome();
              }}
              disabled={loading}
              aria-label="Về trang chủ"
            >
              <Home className="w-5 h-5" />
              <span>Về trang chủ</span>
            </button>

            <h1 className="hero-title">
              Khám phá hội trại <br />
              <span className="gradient-text">đầy màu sắc</span>
            </h1>

            <p className="hero-description">
              Tham gia cùng hàng nghìn gia đình đã tin tưởng chọn chúng tôi cho
              kỳ nghỉ hè tuyệt vời của con em họ
            </p>

            <div className="hero-features">
              <div className="feature-chip">🎨 Nghệ thuật</div>
              <div className="feature-chip">⚽ Thể thao</div>
              <div className="feature-chip">🎭 Biểu diễn</div>
              <div className="feature-chip">🔬 Khoa học</div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="login-form-section">
          <div className="login-card-wrapper">
            <div className="login-card">
              {/* Decorative Elements */}
              <div className="card-glow"></div>

              {/* Header */}
              <div className="login-header">
                <div className="icon-wrapper">
                  <Lock className="w-7 h-7" />
                  <div className="icon-pulse"></div>
                </div>
                <h2 className="login-title">Chào mừng trở lại</h2>
                <p className="login-subtitle">
                  Đăng nhập để tiếp tục hành trình
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="login-form">
                {/* Email Field */}
                <div className="form-group form-group-unborder">
                  <label className="form-label">Email</label>
                  <div
                    className={`input-wrapper ${emailFocused ? "focused" : ""
                      } ${emailError ? "error" : ""}`}
                  >
                    <Mail className="input-icon" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (emailError) setEmailError("");
                        if (loginError) setLoginError("");
                      }}
                      onFocus={() => setEmailFocused(true)}
                      onBlur={() => {
                        setEmailFocused(false);
                        validateEmail(email);
                      }}
                      onKeyDown={handleKeyDown}
                      placeholder="your.email@example.com"
                      disabled={loading}
                      className="flex-1 px-4 py-4 pl-3 !border-0 !outline-none text-base text-slate-800 font-semibold !bg-transparent font-['Quicksand'] placeholder:font-normal placeholder:text-slate-300 autofill:!bg-transparent autofill:!shadow-[inset_0_0_0_1000px_transparent]"
                    />
                  </div>
                  {emailError && <p className="error-message">{emailError}</p>}
                </div>

                {/* Password Field */}
                <div className="form-group form-group-unborder">
                  <label className="form-label">Mật khẩu</label>
                  <div
                    className={`input-wrapper ${passwordFocused ? "focused" : ""
                      } ${passwordError ? "error" : ""}`}
                  >
                    <Lock className="input-icon" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (passwordError) setPasswordError("");
                        if (loginError) setLoginError("");
                      }}
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => {
                        setPasswordFocused(false);
                        validatePassword(password);
                      }}
                      onKeyDown={handleKeyDown}
                      placeholder="••••••••"
                      disabled={loading}
                      className="flex-1 px-4 py-4 pl-3 !border-0 !outline-none text-base text-slate-800 font-semibold !bg-transparent font-['Quicksand'] placeholder:font-normal placeholder:text-slate-300 autofill:!bg-transparent autofill:!shadow-[inset_0_0_0_1000px_transparent]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                      className="toggle-password"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {passwordError && (
                    <p className="error-message">{passwordError}</p>
                  )}
                </div>

                {/* Login Error Message */}
                {loginError && (
                  <div className="login-error-banner">
                    <p>{loginError}</p>
                  </div>
                )}

                {/* Remember & Forgot */}
                <div className="form-options">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      disabled={loading}
                      className="custom-checkbox"
                    />
                    <span>Ghi nhớ đăng nhập</span>
                  </label>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleForgotPassword();
                    }}
                    disabled={loading}
                    className="forgot-link"
                  >
                    Quên mật khẩu?
                  </button>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || !!emailError || !!passwordError}
                  className={`submit-button ${loading ? "loading" : ""}`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="button-icon spin" />
                      <span>Đang đăng nhập...</span>
                    </>
                  ) : (
                    <>
                      <span>Đăng nhập</span>
                      <ArrowRight className="button-icon slide" />
                    </>
                  )}
                </button>
              </form>

              {/* Footer */}
              <div className="login-footer">
                <p>
                  Chưa có tài khoản?{" "}
                  <button
                    type="button"
                    onClick={handleSignUp}
                    disabled={loading}
                    className="signup-link"
                  >
                    Đăng ký ngay
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
