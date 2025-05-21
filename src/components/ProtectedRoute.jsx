import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Navbar from "./Navbar";
import LoadingScreen from "./LoadingScreen";

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </>
  );
};

export default ProtectedRoute;