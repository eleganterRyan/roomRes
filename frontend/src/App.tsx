import React from 'react';
import { 
  createBrowserRouter, 
  RouterProvider,
  createRoutesFromElements,
  Route
} from 'react-router-dom';
import Login from './pages/Login';
import RoomBooking from './pages/RoomBooking';

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<Login />} />
      <Route path="/booking" element={<RoomBooking />} />
    </>
  )
);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
