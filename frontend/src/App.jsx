import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginScreen from "./components/screens/LoginScreen.jsx";
import FactionScreen from "./components/screens/FractionScreen.jsx";
import DesktopGate from "./components/utils/DesktopGate.jsx";
import AmityMap from "./components/map/AmityMap.jsx";
import "./index.css";

export default function App() {
  return (
    <>
      {/* Wider than a phone: show only the "Open on mobile" screen. */}
      <div className="hidden md:block">
        <DesktopGate />
      </div>

      <div className="md:hidden">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/faction" element={<FactionScreen />} />
            <Route path="/dashboard" element={<AmityMap />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </div>
    </>
  );
}