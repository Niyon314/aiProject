import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';

// Lazy load all pages for code splitting
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
  return (
    <BrowserRouter>
      <ThemeProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/anniversaries" element={<Anniversaries />} />
          <Route path="/add" element={<Add />} />
          <Route path="/chores" element={<Chores />} />
          <Route path="/chores/leaderboard" element={<Leaderboard />} />
          <Route path="/bills" element={<Bills />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/theme" element={<ThemeSettings />} />
          <Route path="/fridge" element={<Fridge />} />
          <Route path="/fridge/ai-recipes" element={<AIRecipes />} />
          {/* 吃饭模块（新） */}
          <Route path="/meal" element={<MealHome />} />
          <Route path="/meal/wishlist" element={<MealWishlist />} />
          <Route path="/eating/random" element={<RandomRecommend />} />
          {/* 其他 */}
          <Route path="/messages" element={<Messages />} />
          <Route path="/points" element={<Points />} />
          <Route path="/stats" element={<Statistics />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/movies" element={<MovieList />} />
          <Route path="/diary" element={<Diary />} />
          <Route path="/surprises" element={<SurpriseReminders />} />
          <Route path="/photos" element={<Photos />} />
        </Routes>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
