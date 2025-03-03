import React from 'react';
import { 
  createBrowserRouter, 
  RouterProvider,
  createRoutesFromElements,
  Route,
  Navigate
} from 'react-router-dom';
import Login from './pages/Login';
import RoomBooking from './pages/RoomBooking';
import GuestView from './pages/GuestView';

// 添加路由保护组件
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" />;
  }
  return <>{children}</>;
};

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/login" element={<Login />} />
      <Route path="/guest" element={<GuestView />} />
      <Route path="/" element={<Navigate to="/booking" replace />} />
      <Route 
        path="/booking" 
        element={
          <ProtectedRoute>
            <RoomBooking />
          </ProtectedRoute>
        } 
      />
      {/* 捕获所有未匹配的路由 */}
      <Route path="*" element={<Navigate to="/booking" replace />} />
    </>
  )
);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
