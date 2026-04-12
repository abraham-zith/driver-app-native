import { io, Socket } from "socket.io-client";
import Config from "react-native-config";

export const SOCKET_URL = Config.SOCKET_URL || Config.API_URL || "";

export const socket: Socket = io(SOCKET_URL, {
    transports: ["websocket"],
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000
});