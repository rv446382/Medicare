import React, { useContext, useState, useMemo } from 'react';
import { MdCircleNotifications } from "react-icons/md";
import { DoctorContext } from '../context/DoctorContext';
import { AdminContext } from '../context/AdminContext';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../../frontend/src/context/SocketContext';

const Navbar = () => {
  const { emit } = useSocket();
  const { dToken, setDToken, notification = [] } = useContext(DoctorContext); // default empty array
  const { aToken, setAToken } = useContext(AdminContext);
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);

  console.log("notifications for saurabh pankaj", notification);

  // Number of unread notifications
  const numberOfUnreadNotifications = useMemo(() => {
    return notification.filter((n) => n.isRead === false).length; // safe check
  }, [notification]);

  const logout = () => {
    navigate('/');
    if (dToken) {
      setDToken('');
      emit('logout');
      localStorage.removeItem('dToken');
    }
    if (aToken) {
      setAToken('');
      localStorage.removeItem('aToken');
    }
  };

  const onNotificationClick = (notif) => {
    console.log("Notification clicked:", notif);

    if (notif && notif.isRead === false) {
      notif.isRead = true;
    }

    if (notif?.type === "message" && notif?.extra) {
      navigate(`/doctor-appointments?user-id=${notif.extra}`);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center px-4 sm:px-10 py-3 border-b bg-white">
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
            <img
              className="w-10"
              src="https://png.pngtree.com/png-vector/20190507/ourmid/pngtree-vector-plus-icon-png-image_1025536.jpg"
              alt="Logo Icon"
            />
            <span className="ml-2 text-gray-500 font-medium text-xl">Medicare</span>
          </div>
          <p className="border px-2.5 py-0.5 rounded-full border-gray-500 text-gray-600">
            {aToken ? 'Admin' : 'Doctor'}
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Notification Icon */}
          <div className="relative">
            <MdCircleNotifications
              className="text-3xl cursor-pointer text-gray-400"
              onClick={() => setShowNotifications(!showNotifications)}
            />
            {/* Unread notification count */}
            {numberOfUnreadNotifications > 0 && (
              <div className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {numberOfUnreadNotifications}
              </div>
            )}
          </div>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="bg-primary text-white text-sm px-10 py-2 rounded-full"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Notifications Modal */}
      {showNotifications && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white w-1/3 p-4 rounded-lg shadow-lg">
            <h4 className="text-lg font-medium">Notifications</h4>
            <ul className="space-y-2 mt-4">
              {notification.length > 0 ? (
                notification.map((n, index) => (
                  <li
                    key={n._id || index} // safe key
                    className={`py-1 border-b last:border-b-0 cursor-pointer hover:bg-gray-100 ${n.isRead ? 'text-gray-500' : 'font-bold'}`}
                    onClick={() => onNotificationClick(n)}
                  >
                    {n.content || "No content"} {/* safe fallback */}
                  </li>
                ))
              ) : (
                <li className="text-sm text-gray-500">No notifications</li>
              )}
            </ul>

            <button
              onClick={() => setShowNotifications(false)}
              className="mt-4 w-full bg-primary text-white py-2 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
