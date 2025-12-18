import io from 'socket.io-client';

const SOCKET_URL = 'https://my-chat-app-1kbx.onrender.com'; // Live Render URL
const SOCKET_PATH = '/socket.io'; // Standard Socket.io path

class SocketService {
    constructor() {
        this.socket = null;
    }

    connect(token) {
        if (this.socket && this.socket.connected) {
            return this.socket;
        }

        this.socket = io(SOCKET_URL, {
            path: SOCKET_PATH,
            auth: { token },
            transports: ['websocket'],
        });

        this.socket.on('connect', () => {
            console.log('Socket connected');
        });

        this.socket.on('disconnect', () => {
            console.log('Socket disconnected');
        });

        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    on(event, callback) {
        if (this.socket) {
            this.socket.on(event, callback);
        }
    }

    emit(event, data) {
        if (this.socket) {
            this.socket.emit(event, data);
        }
    }
}

export default new SocketService();
