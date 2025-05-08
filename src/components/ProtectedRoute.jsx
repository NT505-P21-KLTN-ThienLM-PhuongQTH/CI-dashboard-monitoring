import { Navigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useUser(); // Lấy user từ useUser

  console.log("ProtectedRoute user:", user); 

  if (!user.auth) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;