export interface ISocketContext {
    socket: any;
    isConnected: boolean;
    socketId: string | null;

}

export interface RideJoinPayload {
    rideId: string;
    userId: string;
}

export interface ChatMessage {
    id: string;
    sender: 'me' | 'other';
    time: string;
    timestamp: number;
    text?: string;
    image?: string;
    location?: { latitude: number; longitude: number };
    status?: 'pending' | 'sent' | 'delivered' | 'seen';
}