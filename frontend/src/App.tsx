// src/App.tsx
import Login from "./pages/login/login";
import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignUp from "./pages/sign-up/sign-up";
// import { Button } from "@/components/ui/button";
import Dashboard from "@/pages/dashboard";
import TaskAllocationPage from "./pages/task-allocation";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/dashboard" element={<Dashboard />} />
         <Route path="/task-allocation" element={<TaskAllocationPage />} />

      </Routes>
    </Router>
  );
}

export default App;
