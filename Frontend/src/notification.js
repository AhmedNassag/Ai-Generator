import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Initialize Echo
window.Pusher = Pusher;

const notification = new Echo({
    broadcaster: 'reverb',
    key: "eczq6mqamfp4rxpldpti",
    wsHost:"localhost",
    wsPort: 9000,
    enabledTransports: ['ws', 'wss'],
});

export default notification;