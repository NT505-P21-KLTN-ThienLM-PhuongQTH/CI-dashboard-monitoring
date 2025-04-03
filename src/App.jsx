// import { publicRoutes } from "./routes";
// import DefaultLayout from "./layouts/DefaultLayout";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import "./index.css";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";

function App() {
  return (
    <main className="app">
      <BrowserRouter>
        <UserProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Routes>
        </UserProvider>
      </BrowserRouter>
    </main>
  );
}

export default App;

    
  //   <UserProvider>
  //     <BrowserRouter>
  //       <div className="App">
  //         <Routes>
  //           {publicRoutes.map((route, index) => {
  //             const Page = route.component;
  //             let Layout = DefaultLayout;
  //             if (route.layout) {
  //               Layout = route.layout;
  //             }
  //             return (
  //               <Route
  //                 key={index}
  //                 path={route.path}
  //                 element={
  //                   <Layout {...route.props}>
  //                     <Page />
  //                   </Layout>
  //                 }
  //               />
  //             );
  //           })}
  //         </Routes>
  //       </div>
  //     </BrowserRouter>
  // </UserProvider>
