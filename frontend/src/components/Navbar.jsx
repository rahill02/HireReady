import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navLinks = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/start", label: "New Interview" },
    { to: "/history", label: "History" },
    { to: "/analytics", label: "Analytics" },
    { to: "/resume", label: "Resume" },
  ];

  return (
    <nav className="bg-white border-b border-border px-8 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-9">
          <Link
            to="/"
            className="text-[19px] font-bold text-primary-600 tracking-tight"
          >
            HireReady
          </Link>

          {isAuthenticated && (
            <div className="flex items-center gap-7">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={
                      isActive
                        ? "text-sm font-semibold text-primary-600 border-b-[2.5px] border-primary-600 pb-[18px] -mb-[18px]"
                        : "text-sm font-medium text-gray-500 hover:text-primary-600"
                    }
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {isAuthenticated ? (
          <div className="flex items-center gap-3">
            <Link
              to="/profile"
              className="text-sm font-medium text-slate-700 hover:text-primary-600"
            >
              {user?.name}
            </Link>
            <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-300 hover:text-red-500 ml-2"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-sm font-medium text-gray-600 hover:text-primary-600"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-700"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
