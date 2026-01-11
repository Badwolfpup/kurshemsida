import './toastMessage.css';

interface ToastProps {
    message: string;
    onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, onClose }) => (
    <div className="toast" onClick={onClose}>
        {message}
    </div>
);

export default Toast;