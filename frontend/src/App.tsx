// src/App.tsx
import Login from "./pages/login/login";
import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignUp from "./pages/sign-up/sign-up";
// import { Button } from "@/components/ui/button";
import Dashboard from "@/pages/dashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
