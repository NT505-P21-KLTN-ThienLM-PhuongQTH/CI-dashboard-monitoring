import { BrowserRouter, Routes, Route } from "react-router-dom";
import { publicRoutes } from "./routes";
import DefaultLayout from "./layouts/DefaultLayout";
import { UserProvider } from "./contexts/UserContext";
import "./index.css";
import { ToastContainer } from 'react-toastify';

function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <div className="App">
          <Routes>
            {publicRoutes.map((route, index) => {
              const Page = route.component;
              let Layout = DefaultLayout;
              if (route.layout) {
                Layout = route.layout;
              }
              return (
                <Route
                  key={index}
                  path={route.path}
                  element={
                    <Layout {...route.props}>
                      <Page />
                    </Layout>
                  }
                />
              );
            })}
          </Routes>
          <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                closeOnClick
                draggable
                pauseOnHover
                theme="light"
            />
        </div>
      </BrowserRouter>
  </UserProvider>
  );
}

export default App;