import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Schedule from './pages/Schedule';
import Calendar from './pages/Calendar';
import Anniversaries from './pages/Anniversaries';
import Add from './pages/Add';
import Chores from './pages/Chores';
import Leaderboard from './pages/Leaderboard';
import Bills from './pages/Bills';
import Profile from './pages/Profile';
import ThemeSettings from './pages/ThemeSettings';
import Fridge from './pages/Fridge';
import AIRecipes from './pages/AIRecipes';
import RandomRecommend from './pages/RandomRecommend';
import MealVote from './pages/MealVote';
import MealResult from './pages/MealResult';
import Points from './pages/Points';
import Messages from './pages/Messages';
import Statistics from './pages/Statistics';
import Wishlist from './pages/Wishlist';
import MovieList from './pages/MovieList';

function App() {
  return (
    <BrowserRouter>
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
        <Route path="/eating/random" element={<RandomRecommend />} />
        <Route path="/meal-vote" element={<MealVote />} />
        <Route path="/meal-result/:id" element={<MealResult />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/points" element={<Points />} />
        <Route path="/stats" element={<Statistics />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/movies" element={<MovieList />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
