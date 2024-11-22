import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('登录信息:', formData);
    navigate('/booking');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-2xl p-8 w-full max-w-md border border-white/20">
        <h1 className="text-3xl font-bold text-center mb-2 text-white">会议室预订系统</h1>
        <p className="text-blue-100 text-center mb-8">欢迎回来，请登录您的账号</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-blue-100 mb-2">
              用户名
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/10 border border-blue-200/30 rounded-lg 
                       text-white placeholder-blue-200/70 focus:outline-none focus:border-white
                       focus:ring-2 focus:ring-white/20 transition-all duration-200"
              placeholder="请输入用户名"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-blue-100 mb-2">
              密码
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-blue-200/30 rounded-lg 
                         text-white placeholder-blue-200/70 focus:outline-none focus:border-white
                         focus:ring-2 focus:ring-white/20 transition-all duration-200 pr-12"
                placeholder="请输入密码"
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-blue-100 hover:text-white
                         focus:outline-none transition-colors duration-200"
                aria-label={showPassword ? "隐藏密码" : "显示密码"}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-blue-100">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded border-blue-200/30 bg-white/10 
                                              checked:bg-blue-500 checked:border-transparent focus:ring-2 
                                              focus:ring-white/20" />
              <span>记住我</span>
            </label>
            <a href="#" className="text-blue-100 hover:text-white transition-colors duration-200">
              忘记密码？
            </a>
          </div>

          <button
            type="submit"
            className="w-full bg-white/20 text-white py-3 rounded-lg font-medium
                     hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/20
                     transform hover:-translate-y-0.5 transition-all duration-200"
          >
            登录
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-blue-100">还没有账号？</span>
          <a href="#" className="text-white hover:underline ml-1 font-medium">
            立即注册
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login; 