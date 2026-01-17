import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import Loading from "../ui/Loading";

const ProtectedRouteRegister   = ({ children }) => {
  const [isChecking, setIsChecking] = useState(true);
  const { checkAuth, isAuthenticated,isRegistrationDesk, checkSuperAdmin, getUser } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        await checkAuth();
        await isRegistrationDesk();
        await checkSuperAdmin();
        await getUser();
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setIsChecking(false);
      }
    };

    verifyAuth();
  }, [checkAuth, checkSuperAdmin]);

  // Show loading while checking authentication
  if (isChecking) {
    return <Loading />;
  }

  // If not authenticated, redirect to login with return path
  if (!isRegistrationDesk) {
    return (
      <Navigate to="/admin/login" state={{ from: location.pathname }} replace />
    );
  }

  // If authenticated, render the protected content
  return children;
};

export default ProtectedRouteRegister;
