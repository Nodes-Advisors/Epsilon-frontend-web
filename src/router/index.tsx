import { lazy } from 'react';
import { createBrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Login from "../pages/Login";
import LoginRegister from "../pages/LoginRegister";
import { useTokenStore, useUserStore } from '../store/store';

// Lazy-loaded components
const Home = lazy(() => import('../pages/Homepage'));
const About = lazy(() => import('../pages/About'));
const NotFound = lazy(() => import('../pages/NotFound'));
const Profile = lazy(() => import('../pages/Profile'));
const DetailMessage = lazy(() => import('../pages/DetailMessage'));
const GPTdata = lazy(() => import('../components/GPTdata'));
const KPIExcel = lazy(() => import('../pages/KPIExcel'));
const KPIDash = lazy(() => import('../pages/KPIDash'));
const FundCards = lazy(() => import('../pages/FundCards'));
const SavedList = lazy(() => import('../pages/SavedList'));
const UserProfile = lazy(() => import('../pages/UserProfile'));
const NavBar = lazy(() => import('../components/nav-bar'));
const Database = lazy(() => import('../pages/Database'));
const Intelligence = lazy(() => import('../pages/Intelligence'));
const ClientProfile = lazy(() => import('../pages/ClientProfile'));
const Clients = lazy(() => import('../pages/Clients'));

const navWrapper = (children: React.ReactNode, path: string) => {
  // Checking if the path is 'login' or if a token exists
  if (path === 'login' || !useTokenStore.getState().token) {
    console.log("it detects as login or token exists");
    return <div>{<LoginRegister />}</div>;
  } else {
    return (
      <NavBar>
        <div style={{ marginTop: '10vh', width: '100%' }}>{children}</div>
      </NavBar>
    );
  }
};

const router = createBrowserRouter([
  { index: true, element: <Navigate to="/home" /> },
  { path: '/', element: <Navigate to="/home" /> },
  { path: 'home', element: <Home /> },
  { path: 'about', element: <About /> },
  { path: 'fund-cards', element: <FundCards /> },
  { path: 'fund-card/:name', element: <Profile /> },
  { path: '*', element: <NotFound /> },
  { path: 'detailmessage', element: <DetailMessage /> },
  { path: 'login', element: <LoginRegister /> },
  { path: 'gptdata', element: <GPTdata /> },
  { path: 'kpiexcel', element: <KPIExcel /> },
  { path: 'kpi-dash', element: <KPIDash /> },
  { path: 'my-saved-list/:collection', element: <SavedList /> },
  { path: 'user-profile/:username', element: <UserProfile /> },
  { path: 'database', element: <Database /> },
  { path: 'intelligence', element: <Intelligence /> },
  { path: 'client-card/:id', element: <ClientProfile /> },
  { path: 'client-cards', element: <Clients /> },
].map(item => ({ ...item, element: navWrapper(item.element, item.path) })));

export default router;