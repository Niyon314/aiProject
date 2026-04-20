import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

type Mode = 'login' | 'register';

export default function Login() {
  const navigate = useNavigate();
  const { login, register, isLoading, error, clearError } = useAuthStore();
  const [mode, setMode] = useState<Mode>('login');

  // 表单状态
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [inviteCode, setInviteCode] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      if (mode === 'login') {
        await login({ username, password });
      } else {
        if (!nickname.trim()) {
          useAuthStore.getState().error = '请输入昵称';
          return;
        }
        await register({ username, password, nickname, inviteCode: inviteCode || undefined });
      }
      // 登录成功后跳转到首页
      navigate('/', { replace: true });
    } catch (err) {
      // 错误已在 store 中处理
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
         style={{
           background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
         }}>
      <div className="w-full max-w-md">
        {/* Logo / 标题 */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🏠</div>
          <h1 className="text-3xl font-bold text-white mb-2">我们的小家</h1>
          <p className="text-white/80">属于两个人的温馨空间</p>
        </div>

        {/* 登录表单 */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {/* 切换标签 */}
          <div className="flex mb-6 bg-gray-100 rounded-full p-1">
            <button
              type="button"
              onClick={() => { setMode('login'); clearError(); }}
              className={`flex-1 py-2 rounded-full text-sm font-medium transition-all ${
                mode === 'login'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              登录
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); clearError(); }}
              className={`flex-1 py-2 rounded-full text-sm font-medium transition-all ${
                mode === 'register'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              注册
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 用户名 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                用户名
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="请输入用户名"
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            {/* 密码 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                密码
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            {/* 注册时的昵称 */}
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  昵称
                </label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="你想怎么被称呼？"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            )}

            {/* 注册时的邀请码 */}
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  邀请码（可选）
                </label>
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  placeholder="如果有邀请码请输入"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            )}

            {/* 错误提示 */}
            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-xl">
                {error}
              </div>
            )}

            {/* 提交按钮 */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-medium rounded-xl hover:from-purple-600 hover:to-purple-700 focus:ring-4 focus:ring-purple-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  加载中...
                </span>
              ) : (
                mode === 'login' ? '登录' : '注册'
              )}
            </button>
          </form>

          {/* 其他选项 */}
          <div className="mt-6 text-center">
            {mode === 'login' && (
              <button
                type="button"
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                onClick={() => { /* TODO: 忘记密码功能 */ }}
              >
                忘记密码？
              </button>
            )}
          </div>
        </div>

        {/* 底部说明 */}
        <p className="text-center text-white/60 text-sm mt-6">
          {mode === 'login' ? '还没有账号？' : '已有账号？'}
          <button
            type="button"
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); clearError(); }}
            className="text-white font-medium hover:underline ml-1"
          >
            {mode === 'login' ? '立即注册' : '去登录'}
          </button>
        </p>
      </div>
    </div>
  );
}
