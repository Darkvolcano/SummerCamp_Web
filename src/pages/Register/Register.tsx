import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import {
  User,
  Mail,
  Lock,
  Phone,
  Calendar,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  UserPlus,
  Trophy,
} from "lucide-react";
import { PagePath } from "../../enums/page-path.enum";
import { useRegister } from "../../services/userService";
import dayjs from "dayjs";
import "./Register.css";

const Register = () => {
  const navigate = useNavigate();
  const registerMutation = useRegister();
  const [isSliding, setIsSliding] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState("");

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  const validateField = (name: string, value: string) => {
    const newErrors = { ...errors };

    switch (name) {
      case "firstName":
        if (!value) newErrors.firstName = "Tên là bắt buộc";
        else if (value.length < 2)
          newErrors.firstName = "Tên phải có ít nhất 2 ký tự";
        else delete newErrors.firstName;
        break;

      case "lastName":
        if (!value) newErrors.lastName = "Họ là bắt buộc";
        else if (value.length < 2)
          newErrors.lastName = "Họ phải có ít nhất 2 ký tự";
        else delete newErrors.lastName;
        break;

      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value) newErrors.email = "Email là bắt buộc";
        else if (!emailRegex.test(value))
          newErrors.email = "Email không hợp lệ";
        else delete newErrors.email;
        break;

      case "phoneNumber":
        if (!value) newErrors.phoneNumber = "Số điện thoại là bắt buộc";
        else if (!/^[0-9]{10}$/.test(value))
          newErrors.phoneNumber = "Số điện thoại phải có 10 chữ số";
        else delete newErrors.phoneNumber;
        break;

      case "dateOfBirth":
        if (!value) newErrors.dateOfBirth = "Ngày sinh là bắt buộc";
        else {
          const age = dayjs().diff(dayjs(value), "year");
          if (age < 18) newErrors.dateOfBirth = "Bạn phải ít nhất 18 tuổi";
          else delete newErrors.dateOfBirth;
        }
        break;

      case "password":
        if (!value) newErrors.password = "Mật khẩu là bắt buộc";
        else if (value.length < 6)
          newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
        else delete newErrors.password;

        if (confirmPassword && value !== confirmPassword) {
          newErrors.confirmPassword = "Mật khẩu không khớp";
        } else if (confirmPassword) {
          delete newErrors.confirmPassword;
        }
        break;

      case "confirmPassword":
        if (!value) newErrors.confirmPassword = "Xác nhận mật khẩu là bắt buộc";
        else if (value !== password)
          newErrors.confirmPassword = "Mật khẩu không khớp";
        else delete newErrors.confirmPassword;
        break;
    }

    setErrors(newErrors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const fieldsToValidate = [
      "firstName",
      "lastName",
      "email",
      "phoneNumber",
      "dateOfBirth",
      "password",
      "confirmPassword",
    ];
    fieldsToValidate.forEach((field) => {
      const value = eval(field);
      validateField(field, value);
    });

    if (!acceptTerms) {
      message.error("Bạn phải chấp nhận điều khoản dịch vụ");
      return;
    }

    if (Object.keys(errors).length > 0) return;

    try {
      const registerData = {
        firstName,
        lastName,
        email,
        phoneNumber,
        dob: dayjs(dateOfBirth).format("YYYY-MM-DD"),
        password,
      };

      const response = await registerMutation.mutateAsync(registerData);

      if (response) {
        message.success(
          "Đăng ký thành công! Vui lòng kiểm tra email để nhập mã OTP."
        );
        setIsSliding(true);
        setTimeout(() => {
          navigate(PagePath.VERIFY_OTP, {
            state: { email, fromRegister: true },
          });
        }, 600);
      }
    } catch (error: any) {
      const errorMessage =
        error?.responseValue?.message || "Đăng ký thất bại. Vui lòng thử lại.";
      message.error(errorMessage);
    }
  };

  const handleBackToLogin = () => {
    setIsSliding(true);
    setTimeout(() => {
      navigate(PagePath.LOGIN);
    }, 600);
  };

  return (
    <div className="register-page-wrapper">
      {/* Animated Background with Floating Shapes */}
      <div className="register-background">
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
        className={`register-split-container ${
          isSliding ? "slide-out-right" : isVisible ? "slide-in" : ""
        }`}
      >
        {/* Left Side - Register Form */}
        <div className="register-form-section">
          <div className="register-card-wrapper">
            <div className="register-card">
              {/* Decorative Elements */}
              <div className="card-glow"></div>

              {/* Header */}
              <div className="register-header">
                <div className="icon-wrapper">
                  <UserPlus className="w-7 h-7" />
                  <div className="icon-pulse"></div>
                </div>
                <h2 className="register-title">Tạo tài khoản mới</h2>
                <p className="register-subtitle">
                  Bắt đầu hành trình tuyệt vời của bạn
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="register-form">
                {/* Name Fields Row */}
                <div className="form-row">
                  {/* First Name */}
                  <div className="form-group form-group-unborder">
                    <label className="form-label">Tên</label>
                    <div
                      className={`input-wrapper ${
                        focusedField === "firstName" ? "focused" : ""
                      } ${errors.firstName ? "error" : ""}`}
                    >
                      <User className="input-icon" />
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => {
                          setFirstName(e.target.value);
                          if (errors.firstName)
                            setErrors({ ...errors, firstName: "" });
                        }}
                        onFocus={() => setFocusedField("firstName")}
                        onBlur={() => {
                          setFocusedField("");
                          validateField("firstName", firstName);
                        }}
                        placeholder="Tên"
                        disabled={registerMutation.isPending}
                        className="form-input"
                      />
                    </div>
                    {errors.firstName && (
                      <p className="error-message">{errors.firstName}</p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div className="form-group form-group-unborder">
                    <label className="form-label">Họ</label>
                    <div
                      className={`input-wrapper ${
                        focusedField === "lastName" ? "focused" : ""
                      } ${errors.lastName ? "error" : ""}`}
                    >
                      <User className="input-icon" />
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => {
                          setLastName(e.target.value);
                          if (errors.lastName)
                            setErrors({ ...errors, lastName: "" });
                        }}
                        onFocus={() => setFocusedField("lastName")}
                        onBlur={() => {
                          setFocusedField("");
                          validateField("lastName", lastName);
                        }}
                        placeholder="Họ"
                        disabled={registerMutation.isPending}
                        className="form-input"
                      />
                    </div>
                    {errors.lastName && (
                      <p className="error-message">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div className="form-group form-group-unborder">
                  <label className="form-label">Email</label>
                  <div
                    className={`input-wrapper ${
                      focusedField === "email" ? "focused" : ""
                    } ${errors.email ? "error" : ""}`}
                  >
                    <Mail className="input-icon" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors({ ...errors, email: "" });
                      }}
                      onFocus={() => setFocusedField("email")}
                      onBlur={() => {
                        setFocusedField("");
                        validateField("email", email);
                      }}
                      placeholder="your.email@example.com"
                      disabled={registerMutation.isPending}
                      className="form-input"
                    />
                  </div>
                  {errors.email && (
                    <p className="error-message">{errors.email}</p>
                  )}
                </div>

                {/* Phone & Date Row */}
                <div className="form-row">
                  {/* Phone Number */}
                  <div className="form-group form-group-unborder">
                    <label className="form-label">Số điện thoại</label>
                    <div
                      className={`input-wrapper ${
                        focusedField === "phoneNumber" ? "focused" : ""
                      } ${errors.phoneNumber ? "error" : ""}`}
                    >
                      <Phone className="input-icon" />
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => {
                          setPhoneNumber(e.target.value);
                          if (errors.phoneNumber)
                            setErrors({ ...errors, phoneNumber: "" });
                        }}
                        onFocus={() => setFocusedField("phoneNumber")}
                        onBlur={() => {
                          setFocusedField("");
                          validateField("phoneNumber", phoneNumber);
                        }}
                        placeholder="0123456789"
                        disabled={registerMutation.isPending}
                        className="form-input"
                      />
                    </div>
                    {errors.phoneNumber && (
                      <p className="error-message">{errors.phoneNumber}</p>
                    )}
                  </div>

                  {/* Date of Birth */}
                  <div className="form-group form-group-unborder">
                    <label className="form-label">Ngày sinh</label>
                    <div
                      className={`input-wrapper ${
                        focusedField === "dateOfBirth" ? "focused" : ""
                      } ${errors.dateOfBirth ? "error" : ""}`}
                    >
                      <Calendar className="input-icon" />
                      <input
                        type="date"
                        value={dateOfBirth}
                        onChange={(e) => {
                          setDateOfBirth(e.target.value);
                          if (errors.dateOfBirth)
                            setErrors({ ...errors, dateOfBirth: "" });
                        }}
                        onFocus={() => setFocusedField("dateOfBirth")}
                        onBlur={() => {
                          setFocusedField("");
                          validateField("dateOfBirth", dateOfBirth);
                        }}
                        disabled={registerMutation.isPending}
                        className="form-input"
                      />
                    </div>
                    {errors.dateOfBirth && (
                      <p className="error-message">{errors.dateOfBirth}</p>
                    )}
                  </div>
                </div>

                {/* Password */}
                <div className="form-group form-group-unborder">
                  <label className="form-label">Mật khẩu</label>
                  <div
                    className={`input-wrapper ${
                      focusedField === "password" ? "focused" : ""
                    } ${errors.password ? "error" : ""}`}
                  >
                    <Lock className="input-icon" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password)
                          setErrors({ ...errors, password: "" });
                      }}
                      onFocus={() => setFocusedField("password")}
                      onBlur={() => {
                        setFocusedField("");
                        validateField("password", password);
                      }}
                      placeholder="••••••••"
                      disabled={registerMutation.isPending}
                      className="form-input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={registerMutation.isPending}
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
                  {errors.password && (
                    <p className="error-message">{errors.password}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="form-group form-group-unborder">
                  <label className="form-label">Xác nhận mật khẩu</label>
                  <div
                    className={`input-wrapper ${
                      focusedField === "confirmPassword" ? "focused" : ""
                    } ${errors.confirmPassword ? "error" : ""}`}
                  >
                    <Lock className="input-icon" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (errors.confirmPassword)
                          setErrors({ ...errors, confirmPassword: "" });
                      }}
                      onFocus={() => setFocusedField("confirmPassword")}
                      onBlur={() => {
                        setFocusedField("");
                        validateField("confirmPassword", confirmPassword);
                      }}
                      placeholder="••••••••"
                      disabled={registerMutation.isPending}
                      className="form-input"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      disabled={registerMutation.isPending}
                      className="toggle-password"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="error-message">{errors.confirmPassword}</p>
                  )}
                </div>

                {/* Terms Checkbox */}
                <div className="terms-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      disabled={registerMutation.isPending}
                      className="custom-checkbox"
                    />
                    <span>
                      Tôi đồng ý với{" "}
                      <span className="terms-link">Điều khoản dịch vụ</span> và{" "}
                      <span className="terms-link">Chính sách bảo mật</span>
                    </span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={registerMutation.isPending || !acceptTerms}
                  className={`submit-button ${
                    registerMutation.isPending ? "loading" : ""
                  }`}
                >
                  {registerMutation.isPending ? (
                    <>
                      <Loader2 className="button-icon spin" />
                      <span>Đang tạo tài khoản...</span>
                    </>
                  ) : (
                    <>
                      <span>Tạo tài khoản</span>
                      <ArrowRight className="button-icon slide" />
                    </>
                  )}
                </button>
              </form>

              {/* Footer */}
              <div className="register-footer">
                <p>
                  Đã có tài khoản?{" "}
                  <button
                    type="button"
                    onClick={handleBackToLogin}
                    disabled={registerMutation.isPending}
                    className="login-link"
                  >
                    Đăng nhập
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Hero Section */}
        <div className="register-hero-section">
          <div className="hero-content">
            <div className="hero-badge">
              <Trophy className="w-5 h-5" />
              <span>Trải nghiệm tuyệt vời</span>
            </div>

            <h1 className="hero-title">
              Tham gia <br />
              <span className="gradient-text">cộng đồng</span>
            </h1>

            <p className="hero-description">
              Đăng ký ngay để khám phá hàng trăm chương trình trại hè hấp dẫn và
              trải nghiệm không giới hạn
            </p>

            <div className="hero-benefits">
              <div className="benefit-item">
                <div className="benefit-icon">✨</div>
                <div className="benefit-text">
                  <div className="benefit-title">Dễ dàng đăng ký</div>
                  <div className="benefit-desc">
                    Quy trình đơn giản và nhanh chóng
                  </div>
                </div>
              </div>
              <div className="benefit-item">
                <div className="benefit-icon">🎯</div>
                <div className="benefit-text">
                  <div className="benefit-title">Chương trình đa dạng</div>
                  <div className="benefit-desc">
                    Hơn 500+ trại hè cho mọi lứa tuổi
                  </div>
                </div>
              </div>
              <div className="benefit-item">
                <div className="benefit-icon">🛡️</div>
                <div className="benefit-text">
                  <div className="benefit-title">An toàn & tin cậy</div>
                  <div className="benefit-desc">
                    Đội ngũ chuyên nghiệp và tận tâm
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
