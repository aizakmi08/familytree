import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Builder from './pages/Builder';
import Gallery from './pages/Gallery';
import DownloadSuccess from './pages/DownloadSuccess';
import Purchases from './pages/Purchases';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Contact from './pages/Contact';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/builder" element={<Builder />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/download-success" element={<DownloadSuccess />} />
        <Route path="/purchases" element={<Purchases />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

