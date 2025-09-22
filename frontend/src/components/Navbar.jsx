import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useVoting } from "../context/VotingContext.jsx";
import { Vote, Settings, BarChart3 } from "lucide-react";

const Navbar = () => {
  const { isAuthenticated, logout, adminData } = useVoting();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            <img src="/src/assets/logo.png" alt="SMARIDASA Logo" className="h-10 w-10" />
            <h1 className="text-2xl font-bold text-gray-800">SMA NEGERI 10 SAMARINDA</h1>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={() => navigate("/")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                location.pathname === "/"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:text-blue-600"
              } cursor-pointer`}


            >
              Beranda
            </button>

            {isAuthenticated && adminData ? (
              <button
                onClick={() => navigate("/results")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  location.pathname === "/results"
                    ? "bg-green-600 text-white"
                    : "text-gray-600 hover:text-green-600"
                } cursor-pointer`}
              >
                <BarChart3 className="h-4 w-4 inline mr-1" />
                Hasil
              </button>
            ) : null}

            {isAuthenticated ? (
              <>
                <button
                  onClick={() => navigate("/admin")}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    location.pathname === "/admin"
                      ? "bg-purple-600 text-white"
                      : "text-gray-600 hover:text-purple-600"
                  } cursor-pointer`}
                >
                  <Settings className="h-4 w-4 inline mr-1" />
                  Admin Panel
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-lg font-medium text-red-600 hover:text-red-800 cursor-pointer"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => navigate("/admin/login")}
                className="px-4 py-2 rounded-lg font-medium text-gray-600 hover:text-purple-600 cursor-pointer"
              >
                <Settings className="h-4 w-4 inline mr-1" />
                Admin Login
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
