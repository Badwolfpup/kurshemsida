import { useState } from 'react';
import './toastMessage.css';

interface ToastProps {
    message: string;
    onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
    const [fadeOut, setFadeOut] = useState(false);

    const handleClose = () => {
        setFadeOut(true);
        setTimeout(() => {
            onClose();
        }, 500); // Match the CSS transition duration
    };

    return (
        <div className={`toast ${fadeOut ? 'fade-out' : ''}`} onClick={handleClose}>
            {message}
        </div>
    );
};

export default Toast;