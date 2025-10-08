import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { Eye, EyeOff, Mail, Lock, Loader2, ArrowRight, Sun } from 'lucide-react';
import { PagePath } from '../../enums/page-path.enum';
import { useAuthStore } from '../../services/userService';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSliding, setIsSliding] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('Email là bắt buộc');
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError('Email không hợp lệ');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (password: string) => {
    if (!password) {
      setPasswordError('Mật khẩu là bắt buộc');
      return false;
    }
    if (password.length < 6) {
      setPasswordError('Mật khẩu phải có ít nhất 6 ký tự');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) return;

    setLoading(true);
    try {
      const result = await login({ email, password });

      if (result.success) {
        message.success('Đăng nhập thành công!');
        navigate('/');
      } else {
        message.error(result.message || 'Đăng nhập thất bại');
      }
    } catch (error: any) {
      const errorMessage = error?.responseValue?.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    message.info('Chức năng đang được phát triển');
  };

  const handleSignUp = () => {
    setIsSliding(true);
    setTimeout(() => {
      navigate(PagePath.REGISTER);
    }, 600);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
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
      <div className={`login-split-container ${isSliding ? 'slide-out-left' : isVisible ? 'slide-in' : ''}`}>

        {/* Left Side - Hero Section */}
        <div className="login-hero-section">
          <div className="hero-content">
            <div className="hero-badge">
              <Sun className="w-5 h-5" />
              <span>Summer Camp 2025</span>
            </div>

            <h1 className="hero-title">
              Khám phá mùa hè <br />
              <span className="gradient-text">đầy màu sắc</span>
            </h1>

            <p className="hero-description">
              Tham gia cùng hàng nghìn gia đình đã tin tưởng chọn chúng tôi
              cho kỳ nghỉ hè tuyệt vời của con em họ
            </p>

            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-number">500+</div>
                <div className="stat-label">Trại hè</div>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <div className="stat-number">10k+</div>
                <div className="stat-label">Học viên</div>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <div className="stat-number">4.9/5</div>
                <div className="stat-label">Đánh giá</div>
              </div>
            </div>

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
                <p className="login-subtitle">Đăng nhập để tiếp tục hành trình</p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="login-form">
                {/* Email Field */}
                <div className="form-group">
                  <label className="form-label">
                    Email
                  </label>
                  <div className={`input-wrapper ${emailFocused ? 'focused' : ''} ${emailError ? 'error' : ''}`}>
                    <Mail className="input-icon" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (emailError) setEmailError('');
                      }}
                      onFocus={() => setEmailFocused(true)}
                      onBlur={() => {
                        setEmailFocused(false);
                        validateEmail(email);
                      }}
                      onKeyDown={handleKeyDown}
                      placeholder="your.email@example.com"
                      disabled={loading}
                      className="form-input"
                    />
                  </div>
                  {emailError && (
                    <p className="error-message">{emailError}</p>
                  )}
                </div>

                {/* Password Field */}
                <div className="form-group">
                  <label className="form-label">
                    Mật khẩu
                  </label>
                  <div className={`input-wrapper ${passwordFocused ? 'focused' : ''} ${passwordError ? 'error' : ''}`}>
                    <Lock className="input-icon" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (passwordError) setPasswordError('');
                      }}
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => {
                        setPasswordFocused(false);
                        validatePassword(password);
                      }}
                      onKeyDown={handleKeyDown}
                      placeholder="••••••••"
                      disabled={loading}
                      className="form-input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                      className="toggle-password"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {passwordError && (
                    <p className="error-message">{passwordError}</p>
                  )}
                </div>

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
                    onClick={handleForgotPassword}
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
                  className={`submit-button ${loading ? 'loading' : ''}`}
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
                  Chưa có tài khoản?{' '}
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
