import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Icon from "./Icon";

const Sidebar = () => {
  const { logout } = useAuth();

  const navItems = [
    { path: "/", name: "Dashboard", icon: "dashboard" },
    { path: "/subscriptions", name: "Subscriptions", icon: "subscriptions" },
    { path: "/bills", name: "Bills", icon: "bills" },
    { path: "/income", name: "Income", icon: "income" },
    { path: "/settings", name: "Settings", icon: "settings" },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="sidebar">
      <div className="sidebar-content">
        {/* Logo Header */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <svg
              style={{ width: "24px", height: "24px", color: "white" }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <h2 className="sidebar-title">BudgetTracker</h2>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            >
              {({ isActive }) => (
                <>
                  <Icon name={item.icon} size={20} color={isActive ? "white" : "#e2e8f0"} />
                  {item.name}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            <Icon name="logout" size={20} color="#f87171" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
