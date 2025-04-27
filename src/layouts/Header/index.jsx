import React, { useState, useContext } from "react";
import { UserContext } from "../../contexts/UserContext";
import { Link } from "react-router-dom";
import { BellIcon, MenuIcon } from "@heroicons/react/solid";

function Header({ toggleSidebar, isSidebarOpen }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const { user, logout } = useContext(UserContext);

  // Sample notifications (replace with API data)
  const notifications = [
    { id: 1, message: "New build failed in Pipeline A", time: "5m ago" },
    { id: 2, message: "Model accuracy improved to 92%", time: "1h ago" },
  ];

  // Function to get the first letter of the user's name
  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : "U";
  };

  return (
    <div className="flex w-full bg-white shadow-sm z-50">
      <div className="flex flex-grow items-center justify-between px-4 py-3 md:px-6 w-full">
        {/* Sidebar Toggle Button */}
        <button
          onClick={toggleSidebar}
          className="text-gray-600 hover:text-blue-theme focus:outline-none transition-colors duration-200"
        >
          {isSidebarOpen ? (
            <MenuIcon className="h-6 w-6" />
          ) : (
            <MenuIcon className="h-6 w-6" />
          )}
        </button>

        {/* Spacer for desktop */}
        <div className="flex-grow"></div>

        {/* Notification Button */}
        <div className="relative mr-4">
          <button
            onClick={() => setNotificationOpen(!notificationOpen)}
            className="relative text-gray-600 hover:text-blue-theme focus:outline-none"
          >
            <BellIcon className="h-6 w-6" />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-yellow-400 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {notifications.length}
              </span>
            )}
          </button>
          {notificationOpen && (
            <div
              onMouseLeave={() => setNotificationOpen(false)}
              className="absolute right-0 mt-2 w-64 rounded-lg border border-gray-200 bg-white shadow-lg"
            >
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                {notifications.length === 0 ? (
                  <p className="text-sm text-gray-500 mt-2">No new notifications</p>
                ) : (
                  <ul className="mt-2 space-y-2">
                    {notifications.map((notif) => (
                      <li
                        key={notif.id}
                        className="text-sm text-gray-700 hover:bg-gray-100 p-2 rounded"
                      >
                        <p>{notif.message}</p>
                        <p className="text-xs text-gray-500">{notif.time}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 focus:outline-none"
          >
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt="User Avatar"
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-blue-theme flex items-center justify-center text-white font-medium">
                {getInitial(user?.name)}
              </div>
            )}
            <span className="text-sm font-medium text-gray-900">
              Hi, {user?.name || "User"}
            </span>
            <svg
              className="h-4 w-4 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          {dropdownOpen && (
            <div
              onMouseLeave={() => setDropdownOpen(false)}
              className="absolute right-0 mt-2 w-64 rounded-lg border border-gray-200 bg-white shadow-lg"
            >
              <div className="p-4">
                <div className="flex items-center gap-3">
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt="User Avatar"
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-blue-theme flex items-center justify-center text-white font-medium">
                      {getInitial(user?.name)}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {user?.name || "User"}
                    </p>
                    <p className="text-xs text-gray-500">{user?.email || "email@example.com"}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">Role: {user?.role || "User"}</p>
              </div>
              <div className="border-t border-gray-200">
                <Link
                  to="/settings"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-theme"
                >
                  Settings
                </Link>
                <button
                  onClick={logout}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-theme"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Header;