import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import TreeBuilder from './pages/TreeBuilder';
import Themes from './pages/Themes';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tree" element={<TreeBuilder />} />
          <Route path="/themes" element={<Themes />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
