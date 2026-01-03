import { createContext, useContext, useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";

interface SocketContextData {
    socket: Socket | null;
    isConnected: boolean;
}

const SocketContext = createContext<SocketContextData>({
    socket: null,
    isConnected: false,
});

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            // Connect to the backend
            // Replace with your actual backend URL if different
            const socketInstance = io("http://localhost:5000", {
                transports: ["websocket"],
                withCredentials: true,
            });

            socketInstance.on("connect", () => {
                console.log("Socket connected:", socketInstance.id);
                setIsConnected(true);
                // Join a room specific to this user (e.g. by their ID)
                socketInstance.emit("join_user_room", user.id);
            });

            socketInstance.on("disconnect", () => {
                console.log("Socket disconnected");
                setIsConnected(false);
            });

            setSocket(socketInstance);

            return () => {
                socketInstance.disconnect();
            };
        } else {
            if (socket) {
                socket.disconnect();
                setSocket(null);
                setIsConnected(false);
            }
        }
    }, [user]);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};
