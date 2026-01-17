import { Navigate } from "react-router-dom";

const AdminRedirect = () => {
  // Since this component is inside ProtectedRoute, user is already authenticated
  // Just redirect to dashboard
  return <Navigate to="/admin/dashboard" replace />;
};

export default AdminRedirect;
