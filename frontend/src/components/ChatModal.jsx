import React, { useState, useMemo, memo, useRef } from 'react';
import { useSelector } from 'react-redux';
import { IoSend } from 'react-icons/io5';
import { AiOutlineClose, AiOutlineVideoCamera, AiOutlinePlus, AiOutlineSmile } from 'react-icons/ai';
import EmojiPicker from 'emoji-picker-react';
import { useEffect } from 'react';
import { useSocket } from '../context/SocketContext';

import VideoCall from './VideoCalling';

const ChatModal = ({ onClose, docId }) => {
    const { listen, emit, socket } = useSocket();

    const user = useSelector((state) => state.user.user)
    const doctors = useSelector((state) => state.doctor.data);
    const doctor = useMemo(() => {
        return doctors.find((d) => d._id == docId)
    }, [doctors, docId])

    const [isOnline, setIsOnline] = useState(false);
    const [chatId, setChatId] = useState("")

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isVideoCallActive, setIsVideoCallActive] = useState(false);
    const chatContainerRef = useRef(null); // Ref for auto-scroll

    const [callId, setCallId] = useState(null);

    const sendMessage = () => {
        if (input.trim()) {
            emit('message', chatId, 'user', input.trim());
            setMessages([...messages, { text: input, sender: 'user', type: 'text', createdAt: Date.now() }]);
            setInput('');
        }
    };

    const addEmoji = (emojiObject) => {
        setInput((prevInput) => prevInput + emojiObject.emoji);
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const fileType = file.type.startsWith('image') ? 'image' : 'file';
            const reader = new FileReader();

            reader.onload = () => {
                setMessages([...messages, { content: reader.result, sender: 'user', type: fileType, fileName: file.name }]);
            };

            reader.readAsDataURL(file);
        }
    };

    const startVideoCall = () => {
        setIsVideoCallActive(true);
    };

    useEffect(() => {
        if (doctor) {
            emit('user-status', doctor._id, (isOnline) => setIsOnline(isOnline));

            const userStatusHandler = (id, isOnline) => {
                if (id == doctor._id) {
                    setIsOnline(isOnline)
                }
            }
            listen('user-status', userStatusHandler);

            emit('chat', 'user', user._id, doctor._id, (chatId, messages) => {
                setMessages(messages.map((m) => ({ text: m.message, sender: m.sender, isRead: m.isRead, type: 'text', createdAt: m.createdAt })))
                setChatId(chatId);
            })

            const newMessageHandler = (m) => {
                setMessages((prevMessages) => [
                    ...prevMessages,
                    { text: m.message, sender: m.sender, isRead: true, type: 'text', createdAt: m.createdAt },
                ]);
            }
            listen('new-message', newMessageHandler);

            const onCallRecieved = (peerId) => {
                setCallId(peerId);
                setIsVideoCallActive(true);
            }

            listen('peer', onCallRecieved)

            return () => {
                socket?.off('user-status', userStatusHandler);
                socket?.off('new-message', newMessageHandler);
                socket?.off('peer', onCallRecieved);
            }
        }
    }, [doctor])

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white w-full max-w-4xl h-[80vh] rounded-lg shadow-lg flex flex-col">
                {isVideoCallActive ? (
                    <VideoCall 
                        name={doctor.name}
                        remotePeerId={callId}
                        onEndCall={() => (setIsVideoCallActive(false), setCallId(null))}
                        onStartCall={(id) => emit('peer', doctor._id, id)}
                    />
                ) : (
                    <div className="flex-1 flex flex-col">
                        <div className="flex items-center justify-between p-4 border-b">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full overflow-hidden">
                                    <img src={doctor.image} alt={doctor.name} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium">{doctor.name}</h3>
                                    <p className="text-sm text-gray-500">
                                        <span className={`w-2 h-2 rounded-full inline-block mr-1 ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></span> {isOnline ? 'online' : 'offline'}
                                    </p>
                                </div>
                            </div>
                            <div>
                                <button
                                    onClick={startVideoCall}
                                    className="p-2 bg-gray-200 rounded-full hover:bg-gray-300"
                                >
                                    <AiOutlineVideoCamera size={24} />
                                </button>
                                <button onClick={onClose} className="ml-3 text-gray-600 hover:text-gray-900">
                                    <AiOutlineClose size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[60vh]" ref={chatContainerRef}>
                            {messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    {msg.type === 'text' && (
                                        <p
                                            className={`px-4 py-2 rounded-lg ${msg.sender === 'user'
                                                ? 'bg-primary text-white'
                                                : 'bg-gray-200 text-gray-800'
                                                }`}
                                        >
                                            {msg.text}
                                        </p>
                                    )}
                                    {msg.type === 'image' && (
                                        <img
                                            src={msg.content}
                                            alt="uploaded-img"
                                            className="w-32 h-32 object-cover rounded-lg"
                                        />
                                    )}
                                    {msg.type === 'file' && (
                                        <a
                                            href={msg.content}
                                            download={msg.fileName}
                                            className="text-blue-500 underline"
                                        >
                                            {msg.fileName}
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>


                        <div className="relative flex items-center gap-2 pt-2 px-4 border-t">
                            <label className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 cursor-pointer">
                                <AiOutlinePlus size={24} />
                                <input
                                    type="file"
                                    accept="image/*,application/pdf"
                                    className="hidden"
                                    onChange={handleFileUpload}
                                />
                            </label>
                            <input
                                type="text"
                                placeholder="Type a message..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                className="flex-1 px-4 py-2 border focus:outline-none rounded-lg"
                            />
                            <button
                                onClick={() => setShowEmojiPicker((prev) => !prev)}
                                className="p-2 bg-gray-200 rounded-full hover:bg-gray-300"
                            >
                                <AiOutlineSmile size={24} />
                            </button>
                            <button
                                onClick={sendMessage}
                                className="p-2 bg-primary text-white rounded-full hover:bg-primary-dark"
                            >
                                <IoSend size={20} />
                            </button>

                            {showEmojiPicker && (
                                <div className="absolute bottom-16 left-4 bg-white border shadow-lg rounded-lg z-10">
                                    <EmojiPicker onEmojiClick={addEmoji} />
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default memo(ChatModal);
