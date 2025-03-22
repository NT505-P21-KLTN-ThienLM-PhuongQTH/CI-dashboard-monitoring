import Header from "./Header";
import Sidebar from "./Sidebar";

function DefaultLayout({ children }) {
  return (
    <div className="h-full bg-white">
      <div className="lg:pl-72">
        <Header />
      </div>
      <Sidebar />
      <div className="lg:pl-72">{children}</div>
    </div>
  );
}

export default DefaultLayout;
