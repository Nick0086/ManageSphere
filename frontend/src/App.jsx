import { ToastContainer } from 'react-toastify';
import { Navigate, Route, Routes } from 'react-router';
import { Toaster } from './components/ui/toaster';
import Dashboard from './components/Dashboard/Dashboard';
import PrivateRoutes from './common/PrivateRoutes';

import SignIn from './components/Authentication/SignIn';
import Login from './components/Authentication/Login';

import './App.css';
import 'react-toastify/dist/ReactToastify.css';


function App() {
  return (
    <>
      <Routes>
        {/* Public/Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register-user" element={<SignIn />} />

        {/* Protected Routes */}
        <Route element={<PrivateRoutes />}>
          <Route path="/" element={<Dashboard />} />
        </Route>

        {/* Fallback Routes */}
        <Route 
          path="/register-user/*" 
          element={<Navigate to="/register-user" replace />} 
        />
        <Route 
          path="/login/*" 
          element={<Navigate to="/login" replace />} 
        />
        <Route 
          path="*" 
          element={<Navigate to="/" replace />} 
        />
      </Routes>

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