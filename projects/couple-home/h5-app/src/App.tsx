import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Schedule from './pages/Schedule';
import Anniversaries from './pages/Anniversaries';
import Add from './pages/Add';
import Chores from './pages/Chores';
import Leaderboard from './pages/Leaderboard';
import Bills from './pages/Bills';
import Profile from './pages/Profile';
import Fridge from './pages/Fridge';
import RandomRecommend from './pages/RandomRecommend';
import MealVote from './pages/MealVote';
import MealResult from './pages/MealResult';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/anniversaries" element={<Anniversaries />} />
        <Route path="/add" element={<Add />} />
        <Route path="/chores" element={<Chores />} />
        <Route path="/chores/leaderboard" element={<Leaderboard />} />
        <Route path="/bills" element={<Bills />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/fridge" element={<Fridge />} />
        <Route path="/eating/random" element={<RandomRecommend />} />
        <Route path="/meal-vote" element={<MealVote />} />
        <Route path="/meal-result/:id" element={<MealResult />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
