import React, { useState, useContext } from "react";
import { UserContext } from "../../context/UserContext";

function Header() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, logout } = useContext(UserContext);

  return (
    <div className="sticky top-0 z-999 flex w-full bg-white drop-shadow-sm">
      <div className="flex flex-grow items-center justify-between px-4 py-4 shadow-2 md:px-12">
        <div className="hidden sm:block"></div>

        <div className="relative">
          <a className="flex items-center gap-4" href="#" 
        onClick={() => setDropdownOpen(!dropdownOpen)}>
            <span className="block text-sm font-medium text-black">
             {user.userName}
            </span>

            <svg
              className="hidden fill-current sm:block"
              width="12"
              height="8"
              viewBox="0 0 12 8"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M0.410765 0.910734C0.736202 0.585297 1.26384 0.585297 1.58928 0.910734L6.00002 5.32148L10.4108 0.910734C10.7362 0.585297 11.2638 0.585297 11.5893 0.910734C11.9147 1.23617 11.9147 1.76381 11.5893 2.08924L6.58928 7.08924C6.26384 7.41468 5.7362 7.41468 5.41077 7.08924L0.410765 2.08924C0.0853277 1.76381 0.0853277 1.23617 0.410765 0.910734Z"
                fill=""
              ></path>
            </svg>
          </a>

          <div
            onMouseLeave={() => setDropdownOpen(false)}
            className={`absolute right-0 mt-4 flex w-36 flex-col rounded-sm border border-stroke bg-white
         ${dropdownOpen === true ? "block" : "hidden"}`}
          >
            <button className="flex items-center px-6 py-4 text-sm font-medium duration-300 ease-in-out hover:text-blue-600" onClick={logout}>
              Đăng xuất
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;
