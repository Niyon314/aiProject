import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Schedule from './pages/Schedule';
import Add from './pages/Add';
import Chores from './pages/Chores';
import Bills from './pages/Bills';
import Profile from './pages/Profile';
import Fridge from './pages/Fridge';
import RandomRecommend from './pages/RandomRecommend';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/add" element={<Add />} />
        <Route path="/chores" element={<Chores />} />
        <Route path="/bills" element={<Bills />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/fridge" element={<Fridge />} />
        <Route path="/eating/random" element={<RandomRecommend />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
