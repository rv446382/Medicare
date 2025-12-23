import React, { useEffect } from 'react'
import Navbar from './components/Navbar'
import { Routes, Route, useNavigate, useSearchParams } from 'react-router-dom'
import Home from './pages/Home'
import Doctors from './pages/Doctors'
import Login from './pages/Login'
import About from './pages/About'
import Contact from './pages/Contact'
import Appointment from './pages/Appointment'
import MyAppointments from './pages/MyAppointments'
import MyProfile from './pages/MyProfile'
import Footer from './components/Footer'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Verify from './pages/Verify'

import { toast } from "react-toastify";
import { useDispatch, useSelector } from 'react-redux'
import { addNotification } from './store/slices/NotificationSlice'
import { login, USER_TOKEN } from './store/slices/UserSlice'
import { resetDoctor } from './store/slices/DoctorSlice'
import { useSocket } from './context/SocketContext'
import api from './services/api'

const App = () => {
  const { emit, listen, socket } = useSocket();
  const user = useSelector((state) => state.user.user);
  const notifications = useSelector((state) => state.notification);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [search] = useSearchParams();

  

  useEffect(() => {
    const token = localStorage.getItem(USER_TOKEN);
    if (token) {
      api.get('/profile').then((data) => {
        if (data.data.success) {
          dispatch(login({
            user: data.data.user,
            token,
            isDoctor: data.data.type == 'doctor'
          }));
        } else {
          localStorage.removeItem(USER_TOKEN)
        }
      }).catch(() => {
        localStorage.removeItem(USER_TOKEN)
      })
    }
  }, [])

  useEffect(() => {
    if (user) {
      emit('login', user._id, 'user');
    }

    const page = window.location.pathname;
    if (page === '/login' && user) {
      navigate('/')
    }
  }, [user])


  useEffect(() => {
    api.get('/doctor/list').then((data) => {
      if (data.data.success) {
        dispatch(resetDoctor({ data: data.data.doctors, page: 1 }))
      } else {
        toast.error(data.data.message);
      }
    }).catch(() => toast.error('Something went wrong...'))
  }, []);

  useEffect(() => {
    const handler = (message) => {
      const userId = search.get('user-id');
      if (userId != message.senderId) {
        dispatch(
          addNotification({
            content: `Message from ${message.name}`,
            type: 'message',
            extra: message.senderId,
          })
        );
      }
    }

    listen('new-message', handler);

    return () => {
      socket?.off('new-message', handler);
    };
  }, [notifications, search, listen, socket, dispatch]);


  return (
    <div className='mx-4 sm:mx-[10%]'>
      <ToastContainer />
      <Navbar />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/doctors' element={<Doctors />} />
        <Route path='/doctors/:speciality' element={<Doctors />} />
        <Route path='/login' element={<Login />} />
        <Route path='/about' element={<About />} />
        <Route path='/contact' element={<Contact />} />
        <Route path='/appointment/:docId' element={<Appointment />} />
        <Route path='/my-appointments' element={<MyAppointments />} />
        <Route path='/my-profile' element={<MyProfile />} />
        <Route path='/verify' element={<Verify />} />
      </Routes>
      <Footer />
    </div>
  )
}

export default App