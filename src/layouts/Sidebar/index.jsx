import React from "react";

function Sidebar() {
  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-slate-200 bg-white px-6 pb-4">
        <div className="flex h-16 shrink-0 items-center">
          <img
            src="/public/logo.png"
            alt="Logo"
            className="h-12 w-auto"
          />
        </div>
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                <li>
                  <a
                    href="/"
                    className="group flex gap-x-3 rounded-md p-4 text-base leading-6 font-semibold text-slate-700 hover:text-sky-600 hover:bg-gray-50"
                  >
                    <svg
                      className="h-6 w-6 shrink-0 text-slate-400 group-hover:text-sky-600"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                      ></path>
                    </svg>{" "}
                    Trang chủ
                  </a>
                </li>
                <li>
                  <a
                    href="/don-hang"
                    className="group flex gap-x-3 rounded-md p-4 text-base leading-6 font-semibold text-slate-700 hover:text-sky-600 hover:bg-gray-50 "
                  >
                    <svg
                      className="h-6 w-6 shrink-0 text-slate-400 group-hover:text-sky-600"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H6.911a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661z"
                      ></path>
                    </svg>{" "}
                    Đơn hàng
                  </a>
                </li>
                <li>
                  <a
                    href="/san-pham"
                    className="group flex gap-x-3 rounded-md p-4 text-base leading-6 font-semibold text-slate-700 hover:text-sky-600 hover:bg-gray-50 "
                  >
                    <svg
                      className="h-6 w-6 shrink-0 text-slate-400 group-hover:text-sky-600 :text-white :bg-slate-800"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
                      ></path>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 6h.008v.008H6V6z"
                      ></path>
                    </svg>{" "}
                    Sản phẩm
                  </a>
                </li>
                <li>
                  <a
                    href="/tac-gia"
                    className="group flex gap-x-3 rounded-md p-4 text-base leading-6 font-semibold text-slate-700 hover:text-sky-600 hover:bg-gray-50 "
                  >
                    <svg
                      className="h-6 w-6 shrink-0 text-slate-400 group-hover:text-sky-600 :text-white :bg-slate-800"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                    Tác giả
                  </a>
                </li>
                <li>
                  <a
                    href="/danh-gia"
                    className="group flex gap-x-3 rounded-md p-4 text-base leading-6 font-semibold text-slate-700 hover:text-sky-600 hover:bg-gray-50 "
                  >
                    <svg
                      className="h-6 w-6 shrink-0 text-slate-400 group-hover:text-sky-600 :text-white :bg-slate-800"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                      ></path>
                    </svg>{" "}
                    Đánh giá
                  </a>
                </li>
                <li>
                  <a
                    href="/danh-muc"
                    className="group flex gap-x-3 rounded-md p-4 text-base leading-6 font-semibold text-slate-700 hover:text-sky-600 hover:bg-gray-50 "
                  >
                    <svg
                      className="h-6 w-6 shrink-0 text-slate-400 group-hover:text-sky-600 :text-white :bg-slate-800"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 6.878V6a2.25 2.25 0 012.25-2.25h7.5A2.25 2.25 0 0118 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 004.5 9v.878m13.5-3A2.25 2.25 0 0119.5 9v.878m0 0a2.246 2.246 0 00-.75-.128H5.25c-.263 0-.515.045-.75.128m15 0A2.25 2.25 0 0121 12v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6c0-.98.626-1.813 1.5-2.122"
                      ></path>
                    </svg>{" "}
                    Danh mục
                  </a>
                </li>
                <li>
                  <a
                    href="/khach-hang"
                    className="group flex gap-x-3 rounded-md p-4 text-base leading-6 font-semibold text-slate-700 hover:text-sky-600 hover:bg-gray-50 "
                  >
                    <svg
                      className="h-6 w-6 shrink-0 text-slate-400 group-hover:text-sky-600 :text-white :bg-slate-800"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                      ></path>
                    </svg>{" "}
                    Khách hàng
                  </a>
                </li>
              </ul>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}

export default Sidebar;
