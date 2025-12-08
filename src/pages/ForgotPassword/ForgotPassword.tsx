import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import { Mail, Loader2, ArrowRight, KeyRound, Home } from "lucide-react";
import { PagePath } from "../../enums/page-path.enum";
import { useForgotPassword } from "../../services/userService";
import "./ForgotPassword.css";

const ForgotPassword = () => {
    const navigate = useNavigate();
    const forgotPasswordMutation = useForgotPassword();
    const [email, setEmail] = useState("");
    const [isSliding, setIsSliding] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [emailError, setEmailError] = useState("");
    const [emailFocused, setEmailFocused] = useState(false);

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const isEmailValid = validateEmail(email);
        if (!isEmailValid) return;

        setLoading(true);
        forgotPasswordMutation.mutateAsync({ email })
            .then(() => {
                message.success("Mã OTP đã được gửi đến email của bạn!");
                setTimeout(() => {
                    navigate(PagePath.RESET_PASSWORD, { state: { email } });
                }, 1000);
            })
            .catch((error: any) => {
                let errorMessage = "Gửi yêu cầu thất bại. Vui lòng thử lại.";
                if (error?.responseValue?.message) {
                    errorMessage = error.responseValue.message;
                }
                message.error(errorMessage);
            })
            .finally(() => {
                setLoading(false);
            });
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
        <div className="forgot-password-page-wrapper">
            <div className="forgot-password-background">
                <div className="floating-shapes">
                    <div className="shape shape-1"></div>
                    <div className="shape shape-2"></div>
                    <div className="shape shape-3"></div>
                    <div className="shape shape-4"></div>
                    <div className="shape shape-5"></div>
                </div>
            </div>

            <div
                className={`forgot-password-split-container ${isSliding ? "slide-out-left" : isVisible ? "slide-in" : ""
                    }`}
            >
                <div className="forgot-password-hero-section">
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
                            Đặt lại <br />
                            <span className="gradient-text">mật khẩu</span>
                        </h1>

                        <p className="hero-description">
                            Nhập email của bạn và chúng tôi sẽ gửi mã xác thực để đặt lại mật
                            khẩu
                        </p>

                        <div className="hero-stats">
                            <div className="stat-item">
                                <div className="stat-number">🔒</div>
                                <div className="stat-label">Bảo mật</div>
                            </div>
                            <div className="stat-divider"></div>
                            <div className="stat-item">
                                <div className="stat-number">⚡</div>
                                <div className="stat-label">Nhanh chóng</div>
                            </div>
                            <div className="stat-divider"></div>
                            <div className="stat-item">
                                <div className="stat-number">✓</div>
                                <div className="stat-label">Dễ dàng</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="forgot-password-form-section">
                    <div className="forgot-password-card-wrapper">
                        <div className="forgot-password-card">
                            <div className="card-glow"></div>

                            <div className="forgot-password-header">
                                <div className="icon-wrapper">
                                    <KeyRound className="w-7 h-7" />
                                    <div className="icon-pulse"></div>
                                </div>
                                <h2 className="forgot-password-title">Quên mật khẩu?</h2>
                                <p className="forgot-password-subtitle">
                                    Nhập email để nhận mã xác thực
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="forgot-password-form">
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

                                <button
                                    type="submit"
                                    disabled={loading || !!emailError}
                                    className={`submit-button ${loading ? "loading" : ""}`}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="button-icon spin" />
                                            <span>Đang gửi...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Gửi mã xác thực</span>
                                            <ArrowRight className="button-icon slide" />
                                        </>
                                    )}
                                </button>
                            </form>

                            <div className="forgot-password-footer">
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

export default ForgotPassword;
