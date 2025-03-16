import { ToastContainer } from 'react-toastify';
import { Navigate, Route, Routes, useLocation } from 'react-router';
import { Toaster } from './components/ui/toaster';
import PrivateRoutes from './common/PrivateRoutes';

import SignIn from './components/Authentication/SignIn';
import Login from './components/Authentication/Login';
import ResetPassword from './components/Authentication/ResetPassword';
import Sidebar from './components/Sidebar/Sidebar';
import Dashboard from './components/Dashboard/Dashboard';
import MenuRoutes from './routes/MenuRoutes';
import QrCodeManagerIndex from './components/Table-QrCode/table-qrcodeIndex';

import './App.css';
import 'react-toastify/dist/ReactToastify.css';
import 'react-image-crop/dist/ReactCrop.css';



function App() {

  const location = useLocation();
  const path = location.pathname.split('/');
  const restrictedRoutes = ['login', 'register-user', 'reset-password'];
  const fullScreen = ['tamplate-editor']
  const isRestrictedRoute = restrictedRoutes.some(route => path.includes(route));
  const isfullScreen = fullScreen?.some(route => path.includes(route));
  // console.log({ isLoginRoute }, location.pathname)

  return (
    <>

      {
        !isRestrictedRoute && (
          <Routes>
            <Route path="/" element={<PrivateRoutes />}>
              <Route path='' element={<Sidebar isfullScreen={isfullScreen} />}>
                <Route path='' element={<div>👋 Hyy</div>} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/menu-management/*" element={<MenuRoutes />} />
                <Route path="/qr-management" element={<QrCodeManagerIndex />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Route>
          </Routes>
        )
      }

      {
        isRestrictedRoute && (
          <Routes >
            <Route exact path="/login" element={<Login />} />
            <Route exact path="/register-user" element={<SignIn />} />
            <Route exact path="/reset-password" element={<ResetPassword />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        )
      }



      {/* Notifications */}
      <ToastContainer limit={3} />
      <Toaster
        position="top-center"
        expand={true}
        toastOptions={{
          className: 'list-none'
        }}
      />
    </>
  );
}

export default App;