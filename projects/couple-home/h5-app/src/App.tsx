import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import { WSNotification } from './components/WSNotification';

// Lazy load all pages for code splitting
const Login = () => <Suspense fallback={<PageLoader />}><LoginLazy /></Suspense>;
const LoginLazy = React.lazy(() => import('./pages/Login'));

const Home = () => <Suspense fallback={<PageLoader />}><HomeLazy /></Suspense>;
const HomeLazy = React.lazy(() => import('./pages/Home'));

const Schedule = () => <Suspense fallback={<PageLoader />}><ScheduleLazy /></Suspense>;
const ScheduleLazy = React.lazy(() => import('./pages/Schedule'));

const Calendar = () => <Suspense fallback={<PageLoader />}><CalendarLazy /></Suspense>;
const CalendarLazy = React.lazy(() => import('./pages/Calendar'));

const Anniversaries = () => <Suspense fallback={<PageLoader />}><AnniversariesLazy /></Suspense>;
const AnniversariesLazy = React.lazy(() => import('./pages/Anniversaries'));

const Add = () => <Suspense fallback={<PageLoader />}><AddLazy /></Suspense>;
const AddLazy = React.lazy(() => import('./pages/Add'));

const Chores = () => <Suspense fallback={<PageLoader />}><ChoresLazy /></Suspense>;
const ChoresLazy = React.lazy(() => import('./pages/Chores'));

const Leaderboard = () => <Suspense fallback={<PageLoader />}><LeaderboardLazy /></Suspense>;
const LeaderboardLazy = React.lazy(() => import('./pages/Leaderboard'));

const Bills = () => <Suspense fallback={<PageLoader />}><BillsLazy /></Suspense>;
const BillsLazy = React.lazy(() => import('./pages/Bills'));

const Profile = () => <Suspense fallback={<PageLoader />}><ProfileLazy /></Suspense>;
const ProfileLazy = React.lazy(() => import('./pages/Profile'));

const ThemeSettings = () => <Suspense fallback={<PageLoader />}><ThemeSettingsLazy /></Suspense>;
const ThemeSettingsLazy = React.lazy(() => import('./pages/ThemeSettings'));

const Fridge = () => <Suspense fallback={<PageLoader />}><FridgeLazy /></Suspense>;
const FridgeLazy = React.lazy(() => import('./pages/Fridge'));

const AIRecipes = () => <Suspense fallback={<PageLoader />}><AIRecipesLazy /></Suspense>;
const AIRecipesLazy = React.lazy(() => import('./pages/AIRecipes'));

const RandomRecommend = () => <Suspense fallback={<PageLoader />}><RandomRecommendLazy /></Suspense>;
const RandomRecommendLazy = React.lazy(() => import('./pages/RandomRecommend'));

const MealHome = () => <Suspense fallback={<PageLoader />}><MealHomeLazy /></Suspense>;
const MealHomeLazy = React.lazy(() => import('./pages/MealHome'));

const MealWishlist = () => <Suspense fallback={<PageLoader />}><MealWishlistLazy /></Suspense>;
const MealWishlistLazy = React.lazy(() => import('./pages/MealWishlist'));

const Points = () => <Suspense fallback={<PageLoader />}><PointsLazy /></Suspense>;
const PointsLazy = React.lazy(() => import('./pages/Points'));

const Messages = () => <Suspense fallback={<PageLoader />}><MessagesLazy /></Suspense>;
const MessagesLazy = React.lazy(() => import('./pages/Messages'));

const Statistics = () => <Suspense fallback={<PageLoader />}><StatisticsLazy /></Suspense>;
const StatisticsLazy = React.lazy(() => import('./pages/Statistics'));

const Wishlist = () => <Suspense fallback={<PageLoader />}><WishlistLazy /></Suspense>;
const WishlistLazy = React.lazy(() => import('./pages/Wishlist'));

const MovieList = () => <Suspense fallback={<PageLoader />}><MovieListLazy /></Suspense>;
const MovieListLazy = React.lazy(() => import('./pages/MovieList'));

const Diary = () => <Suspense fallback={<PageLoader />}><DiaryLazy /></Suspense>;
const DiaryLazy = React.lazy(() => import('./pages/Diary'));

const SurpriseReminders = () => <Suspense fallback={<PageLoader />}><SurpriseRemindersLazy /></Suspense>;
const SurpriseRemindersLazy = React.lazy(() => import('./pages/SurpriseReminders'));

const Photos = () => <Suspense fallback={<PageLoader />}><PhotosLazy /></Suspense>;
const PhotosLazy = React.lazy(() => import('./pages/Photos'));

// Loading component for lazy pages
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  );
}

function App() {
  // 获取用户 ID（从 localStorage 或默认值）
  const getUserId = () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('userId');
      return stored || 'user';
    }
    return 'user';
  };

  // 处理通知点击
  const handleNotificationClick = (notification: any) => {
    console.log('[App] 通知点击:', notification);
    // 根据通知类型跳转到相应页面
    switch (notification.type) {
      case 'new_message':
        window.location.href = '/messages';
        break;
      case 'vote_update':
        window.location.href = '/meal';
        break;
      case 'schedule_reminder':
        window.location.href = '/schedule';
        break;
    }
  };

  return (
    <BrowserRouter>
      <ThemeProvider>
        {/* WebSocket 通知组件 */}
        <WSNotification
          userId={getUserId()}
          wsUrl={import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws'}
          onNotificationClick={handleNotificationClick}
        />
        
        <Routes>
          {/* 公开路由 */}
          <Route path="/login" element={<Login />} />
          
          {/* 需要认证的路由 */}
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/schedule" element={<ProtectedRoute><Schedule /></ProtectedRoute>} />
          <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
          <Route path="/anniversaries" element={<ProtectedRoute><Anniversaries /></ProtectedRoute>} />
          <Route path="/add" element={<ProtectedRoute><Add /></ProtectedRoute>} />
          <Route path="/chores" element={<ProtectedRoute><Chores /></ProtectedRoute>} />
          <Route path="/chores/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
          <Route path="/bills" element={<ProtectedRoute><Bills /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/profile/theme" element={<ProtectedRoute><ThemeSettings /></ProtectedRoute>} />
          <Route path="/fridge" element={<ProtectedRoute><Fridge /></ProtectedRoute>} />
          <Route path="/fridge/ai-recipes" element={<ProtectedRoute><AIRecipes /></ProtectedRoute>} />
          {/* 吃饭模块（新） */}
          <Route path="/meal" element={<ProtectedRoute><MealHome /></ProtectedRoute>} />
          <Route path="/meal/wishlist" element={<ProtectedRoute><MealWishlist /></ProtectedRoute>} />
          <Route path="/eating/random" element={<ProtectedRoute><RandomRecommend /></ProtectedRoute>} />
          {/* 其他 */}
          <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
          <Route path="/points" element={<ProtectedRoute><Points /></ProtectedRoute>} />
          <Route path="/stats" element={<ProtectedRoute><Statistics /></ProtectedRoute>} />
          <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
          <Route path="/movies" element={<ProtectedRoute><MovieList /></ProtectedRoute>} />
          <Route path="/diary" element={<ProtectedRoute><Diary /></ProtectedRoute>} />
          <Route path="/surprises" element={<ProtectedRoute><SurpriseReminders /></ProtectedRoute>} />
          <Route path="/photos" element={<ProtectedRoute><Photos /></ProtectedRoute>} />
        </Routes>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
