import { ToastContainer } from 'react-toastify';
import { Navigate, Route, Routes, useLocation } from 'react-router';
import { Toaster } from './components/ui/toaster';
import PrivateRoutes from './common/PrivateRoutes';

import SignIn from './components/Authentication/SignIn';
import Login from './components/Authentication/Login';
import ResetPassword from './components/Authentication/ResetPassword';
import Sidebar from './components/Sidebar/Sidebar';
import Dashboard from './components/Dashboard/Dashboard';
import TaskManagerIndex from './components/TaskManager/TaskManagerIndex';

import './App.css';
import 'react-toastify/dist/ReactToastify.css';

function App() {

  const location = useLocation();
  const restriction = ['login', 'register-user', 'reset-password']
  const isLoginRoute = location.pathname === "/login" || location.pathname === "/register-user" || location.pathname === '/reset-password';
  console.log({ isLoginRoute }, location.pathname)

  return (
    <>

      {
        !isLoginRoute && (
          <Routes>
            <Route path="/" element={<PrivateRoutes />}>
              <Route path='' element={<Sidebar />}>
                <Route path='' element={<div>👋 Hyy</div>} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/todos" element={<TaskManagerIndex />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Route>
          </Routes>
        )
      }

      {
        isLoginRoute && (
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