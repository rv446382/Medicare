import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const emitQueueRef = useState([])[0]; // Mutable reference for emit queue
    const eventQueueRef = useState([])[0]; // Mutable reference for event queue

    useEffect(() => {
        const newSocket = io("http://localhost:4000");

        setSocket(newSocket);

        newSocket.on("connect", () => {
            console.log("Connected to server", newSocket.id);
            setIsConnected(true);

            emitQueueRef.forEach(([event, ...data]) => {
                newSocket.emit(event, ...data);
            });
            emitQueueRef.length = 0; 

            eventQueueRef.forEach(({ event, callback }) => {
                newSocket.on(event, callback);
            });
            eventQueueRef.length = 0;
        });

        newSocket.on("disconnect", () => {
            console.log("Disconnected from server");
            setIsConnected(false);
        });

        return () => {
            if (newSocket) {
                newSocket.disconnect();
            }
        };
    }, []);

    const emitEvent = (event, ...data) => {
        if (isConnected && socket) {
            socket.emit(event, ...data);
        } else {
            emitQueueRef.push([event, ...data]);
        }
    };

    const listenToEvent = (event, callback) => {
        if (isConnected && socket) {
            socket.on(event, callback);
        } else {
            eventQueueRef.push({ event, callback });
        }
    };

    return (
        <SocketContext.Provider value={{ socket, isConnected, emit: emitEvent, listen: listenToEvent }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error("useSocket must be used within a SocketProvider");
    }

    return context;
};
