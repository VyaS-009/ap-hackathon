import Login  from "./pages/login/login";
import {  BrowserRouter as Router, Routes, Route } from  "react-router";
import SignUp from "./pages/sign-up/sign-up"
function App() {
  return (
    <div className="flex min-h-screen items-center justify-center">
<Router ><Routes>
  <Route path="/" element ={  <Login />}/>
<Route path="/sign-up" element ={  <SignUp  />}/>
</Routes></Router>
  
    </div>
  );
}

export default App;
