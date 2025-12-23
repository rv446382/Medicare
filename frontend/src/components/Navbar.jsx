import React, { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink, useNavigate } from 'react-router-dom';
import { CiBellOn } from "react-icons/ci";

import { assets } from '../assets/assets';
import { logout } from '../store/slices/UserSlice'

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [showMenu, setShowMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const userData = useSelector((store) => store.user.user);

  const notifications = useSelector((store) => store.notification);
  const numberOfUnreadNotifications = useMemo(() => {
    return notifications.reduce((prev, curr) => prev + curr.isRead ? 1 : 0, 0)
  }, [notifications])

  const logoutUser = () => {
    dispatch(logout());
  };

  const onNotificationClick = (notification) => {
    console.log("notification for saurabh pankaj", notification);
    if (notification.type === "message") {
      console.log("Navigating to:", `/my-appointments?user-id=${notification.extra}`);
      navigate(`/my-appointments?user-id=${notification.extra}`);
    }
  };


  return (
    <div className="flex items-center justify-between text-sm py-4 mb-5 border-b border-b-[#ADADAD]">
      <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
        {/* Icon */}
        <img
          className="w-10"
          src="https://png.pngtree.com/png-vector/20190507/ourmid/pngtree-vector-plus-icon-png-image_1025536.jpg"
          alt="Logo Icon"
        />

        {/* Text */}
        <span className="ml-2 text-gray-500 font-medium text-xl">Medicare</span>
      </div>

      <ul className="md:flex items-start gap-5 font-medium hidden">
        <NavLink to="/">
          <li className="py-1 text-gray-500">HOME</li>
          <hr className="border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden" />
        </NavLink>
        <NavLink to="/doctors">
          <li className="py-1 text-gray-500">ALL DOCTORS</li>
          <hr className="border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden" />
        </NavLink>
        <NavLink to="/about">
          <li className="py-1 text-gray-500">ABOUT</li>
          <hr className="border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden" />
        </NavLink>
        <NavLink to="/contact">
          <li className="py-1 text-gray-500">CONTACT</li>
          <hr className="border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden" />
        </NavLink>
      </ul>

      <div className="flex items-center gap-4">
        {userData ? (
          <div className="flex items-center gap-4">
            {/* Notification Icon */}
            <div className="relative">
              <CiBellOn className='size-6 text-gray-500 cursor-pointer' onClick={() => setShowNotifications(!showNotifications)} />
              {numberOfUnreadNotifications != '0' && <span className='absolute top-[-8px] right-0 text-sm font-medium font-sans text-gray-500'>{numberOfUnreadNotifications}</span>}
              {/* <img
                className="w-6 cursor-pointer"
                src="https://cdn-icons-png.flaticon.com/512/1827/1827392.png" 
                alt="Notification Bell"
                onClick={() => setShowNotifications(!showNotifications)}
              /> */}
              {showNotifications && (
                <div className="absolute top-8 right-0 w-64 max-h-72 overflow-y-scroll bg-white shadow-lg rounded-md p-4 z-30">
                  <h3 className="text-gray-700 font-medium mb-2">Notifications</h3>
                  {notifications.length ? (
                    <ul className="text-gray-600 text-sm">
                      {notifications.map((notification) => (
                        <li key={notification.id} className="py-1 border-b last:border-b-0 cursor-pointer hover:bg-gray-100" onClick={() => onNotificationClick(notification)}>
                          {notification.content}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 text-sm">No new notifications</p>
                  )}
                </div>
              )}
            </div>

            {/* Profile Section */}
            <div className="flex items-center gap-2 cursor-pointer group relative">
              <img className="w-8 rounded-full" src={userData.image} alt="" />
              <img className="w-2.5" src={assets.dropdown_icon} alt="" />
              <div className="absolute top-0 right-0 pt-14 text-base font-medium text-gray-600 z-20 hidden group-hover:block">
                <div className="min-w-48 bg-gray-50 rounded flex flex-col gap-4 p-4">
                  <p
                    onClick={() => navigate('/my-profile')}
                    className="hover:text-black cursor-pointer"
                  >
                    My Profile
                  </p>
                  <p
                    onClick={() => navigate('/my-appointments')}
                    className="hover:text-black cursor-pointer"
                  >
                    My Appointments
                  </p>
                  <p onClick={logoutUser} className="hover:text-black cursor-pointer">
                    Logout
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="bg-primary text-white px-8 py-3 rounded-full font-light hidden md:block"
          >
            Create account
          </button>
        )}

        <img
          onClick={() => setShowMenu(true)}
          className="w-6 md:hidden"
          src={assets.menu_icon}
          alt=""
        />

        {/* ---- Mobile Menu ---- */}
        <div
          className={`md:hidden ${showMenu ? 'fixed w-full' : 'h-0 w-0'} right-0 top-0 bottom-0 z-20 overflow-hidden bg-white transition-all`}
        >
          <div className="flex items-center justify-between px-5 py-6">
            <img src={assets.logo} className="w-36" alt="" />
            <img
              onClick={() => setShowMenu(false)}
              src={assets.cross_icon}
              className="w-7"
              alt=""
            />
          </div>
          <ul className="flex flex-col items-center gap-2 mt-5 px-5 text-lg font-medium">
            <NavLink onClick={() => setShowMenu(false)} to="/">
              <p className="px-4 py-2 rounded full inline-block">HOME</p>
            </NavLink>
            <NavLink onClick={() => setShowMenu(false)} to="/doctors">
              <p className="px-4 py-2 rounded full inline-block">ALL DOCTORS</p>
            </NavLink>
            <NavLink onClick={() => setShowMenu(false)} to="/about">
              <p className="px-4 py-2 rounded full inline-block">ABOUT</p>
            </NavLink>
            <NavLink onClick={() => setShowMenu(false)} to="/contact">
              <p className="px-4 py-2 rounded full inline-block">CONTACT</p>
            </NavLink>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
