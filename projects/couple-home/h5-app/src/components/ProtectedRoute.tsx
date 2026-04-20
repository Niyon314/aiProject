import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, checkAuth, isLoading, loadUser } = useAuthStore();

  useEffect(() => {
    // 检查认证状态
    const isAuth = checkAuth();
    
    if (!isAuth && !isLoading) {
      // 未登录，重定向到登录页
      // 保存当前路径，登录后可返回
      navigate('/login', { 
        replace: true,
        state: { from: location.pathname }
      });
      return;
    }

    // 如果已认证但还没有用户信息，加载用户信息
    if (isAuth && !useAuthStore.getState().user) {
      loadUser();
    }
  }, [isAuthenticated, isLoading, navigate, location.pathname, checkAuth, loadUser]);

  // 加载中显示加载动画
  if (isLoading || (isAuthenticated && !useAuthStore.getState().user)) {
    return (
      <div className="flex items-center justify-center min-h-screen"
           style={{
             background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
           }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">加载中...</p>
        </div>
      </div>
    );
  }

  // 已认证，渲染子组件
  return <>{children}</>;
}
