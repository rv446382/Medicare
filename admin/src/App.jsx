import React, { useContext, useEffect } from 'react'
import { DoctorContext } from './context/DoctorContext';
import { AdminContext } from './context/AdminContext';
import { Route, Routes } from 'react-router-dom'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Admin/Dashboard';
import AllAppointments from './pages/Admin/AllAppointments';
import AddDoctor from './pages/Admin/AddDoctor';
import DoctorsList from './pages/Admin/DoctorsList';
import Login from './pages/Login';
import DoctorAppointments from './pages/Doctor/DoctorAppointments';
import DoctorDashboard from './pages/Doctor/DoctorDashboard';
import DoctorProfile from './pages/Doctor/DoctorProfile';
import { useSocket } from '../../frontend/src/context/SocketContext';
import { useSearchParams } from 'react-router-dom'

const App = () => {
  const { emit, listen, socket } = useSocket()
  const { dToken, profileData, getProfileData, addNotification } = useContext(DoctorContext)
  const { aToken } = useContext(AdminContext);

  const [search] = useSearchParams();

  useEffect(() => {
    if (profileData) {
      emit('login', profileData._id, 'doctor');
    }
  }, [profileData])

  useEffect(() => {
    getProfileData();
  }, [])


  useEffect(() => {
    const handler = (message) => {
      const userId = search.get('user-id');
      if (userId != message.senderId) {
        addNotification({
          content: `Message from ${message.name}`,
          type: 'message',
          extra: message.senderId,
        });
      }
    }

    listen('new-message', handler);

    return () => {
      socket?.off('new-message', handler);
    };
  }, [search, listen, socket]);

  return dToken || aToken ? (
    <div className='bg-[#F8F9FD]'>
      <ToastContainer />
      <Navbar />
      <div className='flex items-start'>
        <Sidebar />
        <Routes>
          <Route path='/' element={<></>} />
          <Route path='/admin-dashboard' element={<Dashboard />} />
          <Route path='/all-appointments' element={<AllAppointments />} />
          <Route path='/add-doctor' element={<AddDoctor />} />
          <Route path='/doctor-list' element={<DoctorsList />} />
          <Route path='/doctor-dashboard' element={<DoctorDashboard />} />
          <Route path='/doctor-appointments' element={<DoctorAppointments />} />
          <Route path='/doctor-profile' element={<DoctorProfile />} />
        </Routes>
      </div>
    </div>
  ) : (
    <>
      <ToastContainer />
      <Login />
    </>
  )
}

export default App