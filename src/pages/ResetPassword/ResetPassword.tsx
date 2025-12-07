import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { message } from "antd";
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    Loader2,
    ArrowRight,
    KeyRound,
    Home,
    Hash,
} from "lucide-react";
import { PagePath } from "../../enums/page-path.enum";
import { useResetPassword } from "../../services/userService";
import "./ResetPassword.css";

const ResetPassword = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const resetPasswordMutation = useResetPassword();
    const emailFromState = location.state?.email || "";

    const [email, setEmail] = useState(emailFromState);
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSliding, setIsSliding] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    const [emailError, setEmailError] = useState("");
    const [otpError, setOtpError] = useState("");
    const [newPasswordError, setNewPasswordError] = useState("");
    const [confirmPasswordError, setConfirmPasswordError] = useState("");

    const [emailFocused, setEmailFocused] = useState(false);
    const [otpFocused, setOtpFocused] = useState(false);
    const [newPasswordFocused, setNewPasswordFocused] = useState(false);
    const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);

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

    const validateOtp = (otp: string) => {
        if (!otp) {
            setOtpError("Mã OTP là bắt buộc");
            return false;
        }
        if (otp.length !== 6) {
            setOtpError("Mã OTP phải có 6 ký tự");
            return false;
        }
        setOtpError("");
        return true;
    };

    const validateNewPassword = (password: string) => {
        if (!password) {
            setNewPasswordError("Mật khẩu mới là bắt buộc");
            return false;
        }
        if (password.length < 6) {
            setNewPasswordError("Mật khẩu phải có ít nhất 6 ký tự");
            return false;
        }
        setNewPasswordError("");
        return true;
    };

    const validateConfirmPassword = (password: string) => {
        if (!password) {
            setConfirmPasswordError("Xác nhận mật khẩu là bắt buộc");
            return false;
        }
        if (password !== newPassword) {
            setConfirmPasswordError("Mật khẩu không khớp");
            return false;
        }
        setConfirmPasswordError("");
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const isEmailValid = validateEmail(email);
        const isOtpValid = validateOtp(otp);
        const isNewPasswordValid = validateNewPassword(newPassword);
        const isConfirmPasswordValid = validateConfirmPassword(confirmPassword);

        if (
            !isEmailValid ||
            !isOtpValid ||
            !isNewPasswordValid ||
            !isConfirmPasswordValid
        )
            return;

        setLoading(true);
        try {
            await resetPasswordMutation.mutateAsync({
                email,
                otp,
                newPassword,
            });
            message.success("Đặt lại mật khẩu thành công!");
            setTimeout(() => {
                navigate(PagePath.LOGIN);
            }, 1000);
        } catch (error: any) {
            let errorMessage = "Đặt lại mật khẩu thất bại. Vui lòng thử lại.";
            if (error?.responseValue?.message) {
                errorMessage = error.responseValue.message;
            }
            message.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleGoBack = () => {
        setIsSliding(true);
        setTimeout(() => {
            navigate(PagePath.LOGIN);
        }, 600);
    };

    const handleGoHome = () => {
        setIsSliding(true);
        setTimeout(() => {
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
        <div className="reset-password-page-wrapper">
            <div className="reset-password-background">
                <div className="floating-shapes">
                    <div className="shape shape-1"></div>
                    <div className="shape shape-2"></div>
                    <div className="shape shape-3"></div>
                    <div className="shape shape-4"></div>
                    <div className="shape shape-5"></div>
                </div>
            </div>

            <div
                className={`reset-password-split-container ${isSliding ? "slide-out-left" : isVisible ? "slide-in" : ""
                    }`}
            >
                <div className="reset-password-hero-section">
                    <div className="hero-content">
                        <button
                            type="button"
                            className="hero-home-button"
                            onClick={handleGoHome}
                            disabled={loading}
                            aria-label="Về trang chủ"
                        >
                            <Home className="w-5 h-5" />
                            <span>Về trang chủ</span>
                        </button>

                        <h1 className="hero-title">
                            Tạo mật khẩu <br />
                            <span className="gradient-text">mới</span>
                        </h1>

                        <p className="hero-description">
                            Nhập mã OTP đã được gửi đến email và tạo mật khẩu mới cho tài
                            khoản của bạn
                        </p>

                        <div className="hero-stats">
                            <div className="stat-item">
                                <div className="stat-number">🔐</div>
                                <div className="stat-label">An toàn</div>
                            </div>
                            <div className="stat-divider"></div>
                            <div className="stat-item">
                                <div className="stat-number">🛡️</div>
                                <div className="stat-label">Bảo mật</div>
                            </div>
                            <div className="stat-divider"></div>
                            <div className="stat-item">
                                <div className="stat-number">✅</div>
                                <div className="stat-label">Tin cậy</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="reset-password-form-section">
                    <div className="reset-password-card-wrapper">
                        <div className="reset-password-card">
                            <div className="card-glow"></div>

                            <div className="reset-password-header">
                                <div className="icon-wrapper">
                                    <KeyRound className="w-7 h-7" />
                                    <div className="icon-pulse"></div>
                                </div>
                                <h2 className="reset-password-title">Đặt lại mật khẩu</h2>
                                <p className="reset-password-subtitle">
                                    Nhập mã OTP và mật khẩu mới
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="reset-password-form">
                                <div className="form-group">
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
                                    {emailError && <p className="error-message">{emailError}</p>}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Mã OTP</label>
                                    <div
                                        className={`input-wrapper ${otpFocused ? "focused" : ""} ${otpError ? "error" : ""
                                            }`}
                                    >
                                        <Hash className="input-icon" />
                                        <input
                                            type="text"
                                            value={otp}
                                            onChange={(e) => {
                                                setOtp(e.target.value);
                                                if (otpError) setOtpError("");
                                            }}
                                            onFocus={() => setOtpFocused(true)}
                                            onBlur={() => {
                                                setOtpFocused(false);
                                                validateOtp(otp);
                                            }}
                                            onKeyDown={handleKeyDown}
                                            placeholder="Nhập mã OTP 6 ký tự"
                                            maxLength={6}
                                            disabled={loading}
                                            className="form-input"
                                        />
                                    </div>
                                    {otpError && <p className="error-message">{otpError}</p>}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Mật khẩu mới</label>
                                    <div
                                        className={`input-wrapper ${newPasswordFocused ? "focused" : ""
                                            } ${newPasswordError ? "error" : ""}`}
                                    >
                                        <Lock className="input-icon" />
                                        <input
                                            type={showNewPassword ? "text" : "password"}
                                            value={newPassword}
                                            onChange={(e) => {
                                                setNewPassword(e.target.value);
                                                if (newPasswordError) setNewPasswordError("");
                                                if (confirmPassword) {
                                                    validateConfirmPassword(confirmPassword);
                                                }
                                            }}
                                            onFocus={() => setNewPasswordFocused(true)}
                                            onBlur={() => {
                                                setNewPasswordFocused(false);
                                                validateNewPassword(newPassword);
                                            }}
                                            onKeyDown={handleKeyDown}
                                            placeholder="Nhập mật khẩu mới"
                                            disabled={loading}
                                            className="form-input"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            disabled={loading}
                                            className="toggle-password"
                                            tabIndex={-1}
                                        >
                                            {showNewPassword ? (
                                                <EyeOff className="w-5 h-5" />
                                            ) : (
                                                <Eye className="w-5 h-5" />
                                            )}
                                        </button>
                                    </div>
                                    {newPasswordError && (
                                        <p className="error-message">{newPasswordError}</p>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Xác nhận mật khẩu</label>
                                    <div
                                        className={`input-wrapper ${confirmPasswordFocused ? "focused" : ""
                                            } ${confirmPasswordError ? "error" : ""}`}
                                    >
                                        <Lock className="input-icon" />
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={confirmPassword}
                                            onChange={(e) => {
                                                setConfirmPassword(e.target.value);
                                                if (confirmPasswordError) setConfirmPasswordError("");
                                            }}
                                            onFocus={() => setConfirmPasswordFocused(true)}
                                            onBlur={() => {
                                                setConfirmPasswordFocused(false);
                                                validateConfirmPassword(confirmPassword);
                                            }}
                                            onKeyDown={handleKeyDown}
                                            placeholder="Nhập lại mật khẩu mới"
                                            disabled={loading}
                                            className="form-input"
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowConfirmPassword(!showConfirmPassword)
                                            }
                                            disabled={loading}
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
                                    {confirmPasswordError && (
                                        <p className="error-message">{confirmPasswordError}</p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={
                                        loading ||
                                        !!emailError ||
                                        !!otpError ||
                                        !!newPasswordError ||
                                        !!confirmPasswordError
                                    }
                                    className={`submit-button ${loading ? "loading" : ""}`}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="button-icon spin" />
                                            <span>Đang xử lý...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Đặt lại mật khẩu</span>
                                            <ArrowRight className="button-icon slide" />
                                        </>
                                    )}
                                </button>
                            </form>

                            <div className="reset-password-footer">
                                <p>
                                    Nhớ mật khẩu?{" "}
                                    <button
                                        type="button"
                                        onClick={handleGoBack}
                                        disabled={loading}
                                        className="back-link"
                                    >
                                        Đăng nhập
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

export default ResetPassword;
