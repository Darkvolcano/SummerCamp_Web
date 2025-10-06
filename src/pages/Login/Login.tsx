import { useState } from 'react';
import loginBackground from '../../assets/login-background.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = () => {
    // Handle login logic here
    console.log('Login submitted:', { email, password, rememberMe });
  };

  const handleGoogleLogin = () => {
    // Handle Google login logic
    console.log('Google login clicked');
  };

  const handleForgotPassword = () => {
    console.log('Forgot password clicked');
  };

  const handleSignUp = () => {
    console.log('Sign up clicked');
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
      {/* Login Form Container */}
      <div className="relative z-10" style={{ width: '400px', minHeight: '550px' }}>
        <div className="w-full h-full flex flex-col p-8 shadow-2xl overflow-hidden" style={{
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          borderRadius: '25px'
        }}>
          {/* Welcome Text */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Camp Ease
            </h1>

          </div>

          {/* Google Login Button */}
          <div className="mb-5 flex justify-center">
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="bg-white border-2 border-gray-300 rounded-full flex items-center justify-center gap-2 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm overflow-hidden"
              style={{ width: '180px', height: '40px' }}
            >
              <div className="flex items-center justify-center" style={{ width: '18px', height: '18px' }}>
                <svg className="w-full h-full" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              </div>

            </button>
          </div>

          {/* Divider */}
          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-400"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 text-gray-600 font-medium" style={{ backgroundColor: 'rgba(242, 242, 242, 0)' }}>Hoặc</span>
            </div>
          </div>

          {/* Login Form */}
          <div className="w-full">
            {/* Email Field */}
            <div className="mb-4 w-full">
              <label htmlFor="email" className="block text-gray-800 font-semibold mb-2 text-sm">
                E-Mail
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email..."
                className="w-full px-4 py-3.5 rounded-full border-2 border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white text-gray-800 placeholder-gray-400 text-base transition-all duration-200"
                style={{ maxWidth: '100%', boxSizing: 'border-box' }}
              />
            </div>

            {/* Password Field */}
            <div className="mb-4 w-full">
              <label htmlFor="password" className="block text-gray-800 font-semibold mb-2 text-sm">
                Mật khẩu
              </label>
              <div className="relative w-full">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password@123"
                  className="w-full px-4 py-3.5 rounded-full border-2 border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white text-gray-800 placeholder-gray-400 text-base transition-all duration-200"
                  style={{ paddingRight: '48px', maxWidth: '100%', boxSizing: 'border-box' }}
                />
                {/* <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  style={{ right: '16px' }}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  )}
                </button> */}
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between mb-6">
              <label htmlFor="remember" className="flex items-center cursor-pointer group">
                <input
                  id="remember"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-2 border-gray-400 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer transition-all"
                />
                <span className="ml-2 text-sm text-gray-700 font-medium group-hover:text-gray-900 transition-colors">Ghi nhớ đăng nhập</span>
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-gray-700 hover:text-gray-900 font-medium underline transition-colors"
                style={{ backgroundColor: 'rgba(242, 242, 242, 0)' }}
              >
                Quên mật khẩu?
              </button>
            </div>

            {/* Sign In Button */}
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full bg-gray-900 text-white py-3 rounded-full font-semibold hover:bg-gray-800 active:bg-black transition-all duration-200 mb-4 text-sm shadow-md hover:shadow-lg"
            >
              Đăng nhập
            </button>

            {/* Sign Up Link */}
            <p className="text-center text-sm text-gray-600">
              Chưa có tải khoản?{' '}
              <button
                type="button"
                onClick={handleSignUp}
                className="text-gray-900 font-semibold hover:underline transition-all"
                style={{ backgroundColor: 'rgba(242, 242, 242, 0)' }}
              >
                Đăng Ký
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

// Trigger Jira Commit