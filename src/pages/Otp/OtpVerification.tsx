import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, RefreshCw, ArrowLeft, CheckCircle2, AlertCircle, Clock, Loader2 } from 'lucide-react';
import { PagePath } from '../../enums/page-path.enum';
import { useVerifyOTP, useResendOTP } from '../../services/userService';
import './OtpVerification.css';

const OtpVerification = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [isSliding, setIsSliding] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [countdown, setCountdown] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const verifyOtpMutation = useVerifyOTP();
    const resendOtpMutation = useResendOTP();

    const email = location.state?.email || 'user@example.com';

    useEffect(() => {
        setTimeout(() => {
            setIsVisible(true);
        }, 50);
    }, []);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setCanResend(true);
        }
    }, [countdown]);

    const handleChange = (index: number, value: string) => {
        if (value.length > 1) {
            value = value.slice(-1);
        }

        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setError('');
        setSuccessMessage('');

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-verify when all digits are entered
        if (newOtp.every(digit => digit !== '') && newOtp.join('').length === 6) {
            handleVerify(newOtp.join(''));
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);

        if (!/^\d+$/.test(pastedData)) return;

        const newOtp = [...otp];
        pastedData.split('').forEach((char, index) => {
            if (index < 6) {
                newOtp[index] = char;
            }
        });
        setOtp(newOtp);
        setError('');
        setSuccessMessage('');

        const nextEmptyIndex = newOtp.findIndex(val => !val);
        if (nextEmptyIndex !== -1) {
            inputRefs.current[nextEmptyIndex]?.focus();
        } else {
            inputRefs.current[5]?.focus();
            // Auto-verify when pasted complete code
            if (newOtp.join('').length === 6) {
                handleVerify(newOtp.join(''));
            }
        }
    };

    const handleVerify = async (otpCode = otp.join('')) => {
        if (otpCode.length !== 6) {
            setError('Vui lòng nhập đầy đủ 6 chữ số');
            return;
        }

        setError('');
        setSuccessMessage('');

        try {
            const response = await verifyOtpMutation.mutateAsync({
                email: email,
                otp: otpCode
            });

            if (response) {
                setSuccessMessage('✅ Mã xác thực thành công!');

                setTimeout(() => {
                    setIsSliding(true);
                    setTimeout(() => {
                        navigate(PagePath.LOGIN);
                    }, 600);
                }, 1000);
            }
        } catch (error: any) {
            console.error('OTP verification failed:', error);

            let errorMessage = 'Xác thực thất bại. Vui lòng thử lại.';

            if (error?.responseValue?.message) {
                errorMessage = error.responseValue.message;
            } else if (error.message) {
                if (error.message.includes('expired')) {
                    errorMessage = 'Mã xác thực đã hết hạn. Vui lòng yêu cầu mã mới.';
                } else if (error.message.includes('invalid') || error.message.includes('incorrect')) {
                    errorMessage = 'Mã xác thực không hợp lệ. Vui lòng kiểm tra và thử lại.';
                } else {
                    errorMessage = error.message;
                }
            }

            setError(errorMessage);
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        }
    };

    const handleResend = async () => {
        if (!canResend || resendOtpMutation.isPending) return;

        setError('');
        setSuccessMessage('');

        try {
            // Note: Backend doesn't have resend-otp endpoint yet
            // This is a placeholder - you may need to implement resend-otp in backend
            // For now, user should go back to register page to retry
            setError('Chức năng gửi lại mã đang được phát triển. Vui lòng quay lại trang đăng ký để thử lại.');

            // Uncomment when backend has resend-otp endpoint:
            // await resendOtpMutation.mutateAsync({ email: email });
            // setSuccessMessage('📧 Mã xác thực mới đã được gửi thành công!');
            // setCountdown(60);
            // setCanResend(false);
            // setOtp(['', '', '', '', '', '']);
            // inputRefs.current[0]?.focus();
        } catch (error: any) {
            const errorMessage = error?.responseValue?.message || 'Gửi lại mã thất bại. Vui lòng thử lại.';
            setError(errorMessage);
        }
    };

    const handleBackToRegister = () => {
        setIsSliding(true);
        setTimeout(() => {
            navigate(PagePath.REGISTER);
        }, 600);
    };

    return (
        <div className="otp-page-wrapper">
            {/* Animated Background */}
            <div className="otp-background">
                <div className="floating-shapes">
                    <div className="shape shape-1"></div>
                    <div className="shape shape-2"></div>
                    <div className="shape shape-3"></div>
                    <div className="shape shape-4"></div>
                    <div className="shape shape-5"></div>
                </div>
            </div>

            {/* Main Container */}
            <div className={`otp-container ${isSliding ? 'slide-out' : ''} ${isVisible ? 'slide-in' : ''}`}>
                <div className="otp-card">
                    {/* Header Section */}
                    <div className="otp-header">
                        <div className="otp-icon">
                            <Mail size={48} />
                        </div>
                        <h1 className="otp-title">Xác thực Email</h1>
                        <p className="otp-subtitle">
                            Nhập mã OTP 6 chữ số đã được gửi đến
                        </p>
                        <p className="otp-email">{email}</p>
                    </div>

                    {/* Success Message */}
                    {successMessage && (
                        <div className="otp-alert otp-alert-success">
                            <CheckCircle2 size={20} />
                            <span>{successMessage}</span>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="otp-alert otp-alert-error">
                            <AlertCircle size={20} />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* OTP Input Fields */}
                    <div className="otp-inputs" onPaste={handlePaste}>
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => {
                                    inputRefs.current[index] = el;
                                }}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                disabled={verifyOtpMutation.isPending || resendOtpMutation.isPending}
                                className={`otp-input ${digit ? 'otp-input-filled' : ''} ${error ? 'otp-input-error' : ''}`}
                            />
                        ))}
                    </div>

                    {/* Verify Button */}
                    <button
                        onClick={() => handleVerify()}
                        disabled={otp.join('').length !== 6 || verifyOtpMutation.isPending}
                        className={`otp-verify-button ${otp.join('').length === 6 ? 'active' : ''}`}
                    >
                        {verifyOtpMutation.isPending ? (
                            <>
                                <Loader2 className="button-spinner" size={20} />
                                Đang xác thực...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 size={20} />
                                Xác thực mã
                            </>
                        )}
                    </button>

                    {/* Resend Section */}
                    <div className="otp-resend-section">
                        <p className="otp-resend-text">Bạn chưa nhận được mã?</p>
                        <button
                            onClick={handleResend}
                            disabled={!canResend || resendOtpMutation.isPending}
                            className={`otp-resend-button ${canResend ? 'active' : ''}`}
                        >
                            {resendOtpMutation.isPending ? (
                                <>
                                    <Loader2 className="button-spinner" size={16} />
                                    Đang gửi...
                                </>
                            ) : canResend ? (
                                <>
                                    <RefreshCw size={16} />
                                    Gửi lại mã
                                </>
                            ) : (
                                <>
                                    <Clock size={16} />
                                    Gửi lại sau {countdown}s
                                </>
                            )}
                        </button>
                    </div>

                    {/* Info Box */}
                    <div className="otp-info-box">
                        <div className="info-item">
                            <Clock size={16} />
                            <span>Mã sẽ hết hạn sau 10 phút</span>
                        </div>
                        <div className="info-item">
                            <Mail size={16} />
                            <span>Kiểm tra thư mục spam nếu không thấy email</span>
                        </div>
                    </div>

                    {/* Back Button */}
                    <button
                        onClick={handleBackToRegister}
                        disabled={verifyOtpMutation.isPending || resendOtpMutation.isPending}
                        className="otp-back-button"
                    >
                        <ArrowLeft size={16} />
                        Quay lại đăng ký
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OtpVerification;