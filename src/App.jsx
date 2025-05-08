import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import DefaultLayout from "./layouts/DefaultLayout";
import { UserProvider } from "./contexts/UserContext";
import { ToastContainer } from 'react-toastify';
import { ScrollToTop } from "./components/common/ScrollToTop";
import { publicRoutes } from "./routes";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Repository from "./pages/Repository";
import AccountSettings from "./pages/AccountSettings";
import NotFound from "./pages/OtherPage/NotFound";
import User from "./pages/User";
import ProtectedRoute from "./components/ProtectedRoute";

import TestPage from "./pages/TestPage";

function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            closeOnClick
            draggable
            pauseOnHover
            theme="light"
        />
        <ScrollToTop />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<DefaultLayout />}>
            <Route index path="/" element={<Dashboard />} />
            <Route path="/workflows" element={<TestPage />} />
            <Route path="/prediction-metrics" element={<NotFound />} />
            <Route path="/repositories" element={<Repository />} />
            <Route
              path="/users"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <User />
                </ProtectedRoute>
              }
            />
            <Route path="/settings" element={<AccountSettings />} />
            <Route path="/unauthorized" element={<NotFound />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
  </UserProvider>
  );
}

export default App;