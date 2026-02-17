import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import React, { useState, useContext, useEffect } from 'react';
import DoctorChat from './DoctorChat'; // import DoctorChat
import { DoctorContext } from '../../context/DoctorContext';
import { AppContext } from '../../context/AppContext';
import { useSearchParams } from 'react-router-dom'

const DoctorAppointments = () => {
  const { dToken, appointments, getAppointments, cancelAppointment, completeAppointment } = useContext(DoctorContext);
  const { slotDateFormat, calculateAge, currency } = useContext(AppContext);

  const [search, setSearch] = useSearchParams();

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const handleChatOpen = (appointment) => {
    setSelectedAppointment(appointment);  // Set the selected appointment
    setIsChatOpen(true); // Open the chat
  };

  const handleCloseChat = () => {
    setIsChatOpen(false); // Close the chat
    setSelectedAppointment(null); // Reset the selected appointment
  };

  useEffect(() => {
    if (dToken) {
      getAppointments();
    }
  }, [dToken]);

  const userId = search.get('user-id');
  useEffect(() => {
    const index = appointments.findIndex(a => a.userData._id == userId);
    if (index != -1 && userId) {
      handleChatOpen(appointments[index])
    }
  }, [userId, handleChatOpen])

  return (
    <div className='w-full max-w-6xl m-5'>
      <p className='mb-3 text-lg font-medium'>All Appointments</p>

      <div className='bg-white border rounded text-sm max-h-[80vh] overflow-y-scroll'>
        {/* Table Layout */}
        <table className="min-w-full table-auto text-gray-500">
          <thead className='bg-[#EAEFFF]'>
            <tr className='text-left'>
              <th className='py-2 px-4'>#</th>
              <th className='py-2 px-4'>Patient</th>
              <th className='py-2 px-4'>Payment</th>
              <th className='py-2 px-4'>Age</th>
              <th className='py-2 px-4'>Date & Time</th>
              <th className='py-2 px-4'>Fees</th>
              <th className='py-2 px-4'>Action</th>
              <th className='py-2 px-4'>Chat</th>

            </tr>
          </thead>
          <tbody>
            {appointments.map((item, index) => (
              <tr className='border-b hover:bg-gray-50' key={index}>
                {/* # Column */}
                <td className='py-2 px-4'>{index + 1}</td>

                {/* Patient Info */}
                <td className='py-2 px-4'>
                  <div className='flex items-center gap-2'>
                    <img src={item.userData.image} className='w-8 rounded-full' alt={item.userData.name} />
                    <span>{item.userData.name}</span>
                  </div>
                </td>

                {/* Payment */}
                <td className='py-2 px-4'>
                  <p className='text-xs inline border border-primary px-2 rounded-full'>
                    {item.payment ? 'Online' : 'CASH'}
                  </p>
                </td>

                {/* Age */}
                <td className='py-2 px-4'>{calculateAge(item.userData.dob)}</td>

                {/* Date & Time */}
                <td className='py-2 px-4'>{slotDateFormat(item.slotDate)}, {item.slotTime}</td>

                {/* Fees */}
                <td className='py-2 px-4'>{currency}{item.amount}</td>

                {/* Action (Completed/Cancelled) */}
                <td className='py-2 px-4'>
                  {item.cancelled
                    ? <p className='text-red-400 text-xs font-medium'>Cancelled</p>
                    : item.isCompleted
                      ? <p className='text-green-500 text-xs font-medium'>Completed</p>
                      : <div className='flex gap-2'>
                          <img onClick={() => cancelAppointment(item._id)} className='w-6 cursor-pointer' src={assets.cancel_icon} alt="Cancel Icon" />
                          <img onClick={() => completeAppointment(item._id)} className='w-6 cursor-pointer' src={assets.tick_icon} alt="Complete Icon" />
                        </div>
                  }
                </td>

                {/* Chat Icon */}
                <td className='py-2 px-4'>
                  <IoChatbubbleEllipsesOutline
                    className='w-5 h-5 cursor-pointer text-gray-500 hover:text-primary'
                    onClick={() => handleChatOpen(item)} // Open chat when clicked
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Conditionally render the DoctorChat component */}
      {isChatOpen && selectedAppointment && (
        <DoctorChat
          onClose={handleCloseChat}
          userId={selectedAppointment.userData._id}
          username={selectedAppointment.userData.name}
          userPic={selectedAppointment.userData.image}
        />
      )}
    </div>
  );
};

export default DoctorAppointments;
