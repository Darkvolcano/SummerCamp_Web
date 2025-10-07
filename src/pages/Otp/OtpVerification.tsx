import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { message, Button, Alert } from 'antd';
import { MailOutlined, RedoOutlined } from '@ant-design/icons';
import loginBackground from '../../assets/login-background.png';
import { PagePath } from '../../enums/page-path.enum';

const OtpVerification = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [isSliding, setIsSliding] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [countdown, setCountdown] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const [resending, setResending] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

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

        setLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            // TODO: Implement your OTP verification API call here
            console.log('Verifying OTP:', otpCode, 'for email:', email);

            await new Promise(resolve => setTimeout(resolve, 1000));

            setSuccessMessage('✅ Mã xác thực thành công!');

            setTimeout(() => {
                setIsSliding(true);
                setTimeout(() => {
                    navigate(PagePath.LOGIN);
                }, 600);
            }, 1000);
        } catch (error: any) {
            console.error('OTP verification failed:', error);

            let errorMessage = 'Xác thực thất bại. Vui lòng thử lại.';

            if (error.message) {
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
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (!canResend || resending) return;

        setResending(true);
        setError('');
        setSuccessMessage('');

        try {
            // TODO: Implement your resend OTP API call here
            console.log('Resending OTP to:', email);

            await new Promise(resolve => setTimeout(resolve, 500));

            setSuccessMessage('📧 Mã xác thực mới đã được gửi thành công!');
            setCountdown(60);
            setCanResend(false);
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } catch (error) {
            setError('Gửi lại mã thất bại. Vui lòng thử lại.');
        } finally {
            setResending(false);
        }
    };

    const handleBackToRegister = () => {
        setIsSliding(true);
        setTimeout(() => {
            navigate(PagePath.REGISTER);
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
                    width: '480px',
                    minHeight: '550px',
                    transform: isSliding ? 'translateX(150%)' : (isVisible ? 'translateX(0)' : 'translateX(150%)'),
                    opacity: isSliding ? 0 : (isVisible ? 1 : 0),
                    transition: 'transform 0.6s ease-out, opacity 0.6s ease-out',
                }}
            >
                <div className="w-full h-full flex flex-col p-8 shadow-2xl" style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.85)',
                    borderRadius: '25px'
                }}>
                    {/* Icon */}
                    <div className="flex justify-center mb-4">
                        <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{
                            backgroundColor: 'rgba(249, 115, 22, 0.1)',
                        }}>
                            <MailOutlined style={{ fontSize: '40px', color: '#f97316' }} />
                        </div>
                    </div>

                    <h1 className="text-2xl font-bold text-center mb-2" style={{ color: '#ec6426', fontFamily: 'Montserrat, sans-serif' }}>
                        Xác thực Email của bạn
                    </h1>
                    <p className="text-center mb-6 text-sm" style={{ color: '#632713', fontFamily: 'Montserrat, sans-serif' }}>
                        Nhập mã OTP 6 chữ số đã được gửi đến email của bạn
                    </p>

                    {/* Success Message */}
                    {successMessage && (
                        <Alert
                            message={successMessage}
                            type="success"
                            showIcon
                            style={{
                                marginBottom: '20px',
                                borderRadius: '12px',
                                fontFamily: 'Montserrat, sans-serif',
                                fontSize: '14px'
                            }}
                        />
                    )}

                    {/* Error Message */}
                    {error && (
                        <Alert
                            message={error}
                            type="error"
                            showIcon
                            style={{
                                marginBottom: '20px',
                                borderRadius: '12px',
                                fontFamily: 'Montserrat, sans-serif',
                                fontSize: '14px'
                            }}
                        />
                    )}

                    {/* OTP Input Fields */}
                    <div className="flex justify-center gap-2 mb-6" onPaste={handlePaste}>
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
                                disabled={loading || resending}
                                className="text-center font-bold border-2 rounded-xl focus:outline-none transition-all duration-200"
                                style={{
                                    width: '56px',
                                    height: '64px',
                                    fontSize: '24px',
                                    color: '#632713',
                                    fontFamily: 'Montserrat, sans-serif',
                                    backgroundColor: 'white',
                                    borderColor: error ? '#ff4d4f' : (digit ? '#f97316' : '#d9d9d9'),
                                    boxShadow: digit ? '0 0 0 2px rgba(249, 115, 22, 0.1)' : 'none',
                                }}
                            />
                        ))}
                    </div>

                    {/* Verify Button */}
                    <Button
                        type="primary"
                        onClick={() => handleVerify()}
                        loading={loading}
                        disabled={otp.join('').length !== 6 || loading}
                        style={{
                            width: '100%',
                            background: otp.join('').length === 6 ? '#f97316' : '#ffa366',
                            border: 'none',
                            height: '48px',
                            borderRadius: '24px',
                            color: '#fff',
                            fontWeight: 'bold',
                            fontSize: '16px',
                            marginBottom: '24px',
                            fontFamily: 'Montserrat, sans-serif',
                            boxShadow: otp.join('').length === 6 ? '0 4px 12px rgba(249, 115, 22, 0.3)' : 'none',
                        }}
                    >
                        {loading ? 'Đang xác thực...' : 'Xác thực mã'}
                    </Button>

                    {/* Resend Code Section */}
                    <div className="text-center mb-6">
                        <p className="text-sm mb-2" style={{ color: '#632713', fontFamily: 'Montserrat, sans-serif' }}>
                            Bạn chưa nhận được mã?
                        </p>
                        <Button
                            type="text"
                            icon={<RedoOutlined />}
                            onClick={handleResend}
                            disabled={!canResend || resending}
                            loading={resending}
                            style={{
                                color: canResend ? '#f97316' : '#999',
                                fontWeight: 600,
                                fontSize: '14px',
                                fontFamily: 'Montserrat, sans-serif',
                                height: 'auto',
                                padding: '4px 8px',
                            }}
                        >
                            {resending
                                ? 'Đang gửi...'
                                : canResend
                                    ? 'Gửi lại mã'
                                    : `Gửi lại sau ${countdown}s`
                            }
                        </Button>
                    </div>

                    {/* Email Info Box */}
                    <div
                        className="p-4 rounded-xl mb-6"
                        style={{
                            backgroundColor: 'rgba(249, 115, 22, 0.05)',
                            border: '1px solid rgba(249, 115, 22, 0.15)',
                        }}
                    >
                        <p className="text-xs text-center mb-1" style={{ color: '#632713', fontFamily: 'Montserrat, sans-serif' }}>
                            Mã đã được gửi đến: <strong style={{ color: '#f97316' }}>{email}</strong>
                        </p>
                        <p className="text-xs text-center mb-2" style={{ color: '#632713', fontFamily: 'Montserrat, sans-serif' }}>
                            Mã sẽ hết hạn sau 10 phút
                        </p>
                        <p className="text-xs text-center" style={{ color: '#78a243', fontFamily: 'Montserrat, sans-serif' }}>
                            💡 Kiểm tra thư mục spam nếu bạn không thấy email
                        </p>
                    </div>

                    {/* Back to Register Button */}
                    <div className="text-center">
                        <button
                            onClick={handleBackToRegister}
                            disabled={loading || resending}
                            style={{
                                background: 'none',
                                border: 'none',
                                padding: 0,
                                color: '#78a243',
                                fontSize: '14px',
                                textDecoration: 'underline',
                                cursor: 'pointer',
                                fontFamily: 'Montserrat, sans-serif',
                                opacity: loading || resending ? 0.5 : 1,
                            }}
                        >
                            ← Quay lại đăng ký
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OtpVerification;