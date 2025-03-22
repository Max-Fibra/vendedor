import { useEffect } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Metrics from "./pages/Metrics";
import AdminMetrics from "./pages/AdminMetrics";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  // ⛑ Redirecionador automático no client
  useEffect(() => {
    const pathname = window.location.pathname;
    const hasHash = window.location.hash.startsWith("#/");
    const isRoot = pathname === "/" || pathname.includes("index.html");

    if (!hasHash && !isRoot) {
      const search = window.location.search || "";
      const hashPath = "#" + pathname + search;
      window.location.replace("/" + hashPath);
    }
  }, []);

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/metrics" element={<Metrics />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/metrics" element={<AdminMetrics />} />

      </Routes>
    </HashRouter>
  );
}

export default App;
