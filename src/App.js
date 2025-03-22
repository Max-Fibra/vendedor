import { HashRouter, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Metrics from "./pages/Metrics";
import Login from "./pages/Login";

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/metrics" element={<Metrics />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
