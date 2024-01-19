import { lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";

const Home = lazy(() => import("../pages/Homepage"));
const About = lazy(() => import("../pages/About"));
const NotFound = lazy(() => import("../pages/NotFound"));
const Profile = lazy(() => import("../pages/Profile"));
const DetailMessage = lazy(() => import("../pages/DetailMessage"));
// const Login = lazy(() => import('../pages/Login'))


const GPTdata = lazy(() => import("../components/GPTdata"));
const KPIExcel = lazy(() => import("../pages/KPIExcel"));

const KPIDash = lazy(() => import('../pages/KPIDash'))
const FundCards = lazy(() => import('../pages/FundCards'))
const SavedList = lazy(() => import('../pages/SavedList'))
const UserProfile = lazy(() => import('../pages/UserProfile'))
const NavBar = lazy(() => import('../components/nav-bar'))
const Database = lazy(() => import('../pages/Database'))

const navWrapper = (children: React.ReactNode) => 
  <NavBar><div style={{marginTop: '10vh', width: '100%'}}>
    {children}
  </div></NavBar>


const router = createBrowserRouter([
  { index: true, element: <Navigate to="/home" /> },
  { path: "/", element: <Navigate to="/home" /> },
  { path: "home", element: <Home /> },
  { path: "about", element: <About /> },
  { path: "fund-cards", element: <FundCards /> },
  { path: "fund-card/:name", element: <Profile /> },
  { path: "*", element: <NotFound /> },
  { path: "detailmessage", element: <DetailMessage /> },
  // { path: 'login', element: <Login /> },

  { path: "gptdata", element: <GPTdata /> },
  { path: "kpiexcel", element: <KPIExcel /> },
]);

  { path: 'kpi-dash', element: <KPIDash /> },
  { path: 'my-saved-list', element: <SavedList /> },
  { path: 'user-profile', element: <UserProfile /> },
  { path: 'database', element: <Database /> },
].map(item => ({ ...item, element: navWrapper(item.element) })),
)


export default router;
