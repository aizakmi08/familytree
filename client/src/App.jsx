import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Builder from './pages/Builder';
import Gallery from './pages/Gallery';
import DownloadSuccess from './pages/DownloadSuccess';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/builder" element={<Builder />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/download-success" element={<DownloadSuccess />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

