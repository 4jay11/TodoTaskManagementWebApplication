
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import OAuthSuccess from "./pages/OAuthSuccess";
import Login from "./pages/Login";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

function Dashboard() {
  return (
    <>
      <h1 className="text-3xl font-bold underline">
        TODO Task Management Web Application
      </h1>
    </>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/oauth-success" element={<OAuthSuccess />} />
        <Route path="/" element={<Dashboard />} />
      </Routes>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="light"
      />
    </Router>
  );
}

export default App;






    // <Router>
    //   <Routes>
    //     <Route path="/" element={<Login />} />
    //     <Route path="/oauth-success" element={<OAuthSuccess />} />
    //   </Routes>
    // </Router>

