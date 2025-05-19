import { ReactNode } from "react";
import ReactModal from "react-modal";

type ModalProps = {
    isOpen: boolean;
    onClose?: (event: React.MouseEvent | React.KeyboardEvent) => void;
    width?: number;
    height?: number;
    children: (onClose?: (event: React.MouseEvent | React.KeyboardEvent) => void) => ReactNode;
};

export const Modal = ({
    isOpen, onClose,
    children,
    width = 25, height = 35
}: ModalProps) => (
    <ReactModal
        isOpen={isOpen}
        onRequestClose={onClose}
        ariaHideApp={false}
        style={{
            overlay: {
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                zIndex: 2,
            },
            content: {
                top: '50%',
                left: '50%',
                right: 'auto',
                bottom: 'auto',
                marginRight: '-50%',
                transform: 'translate(-50%, -50%)',
                backgroundColor: 'var(--button)',
                border: 'none',
                borderRadius: '1rem',
                width: `${width}rem`,
                height: `${height}rem`,
            },
        }}
    >{children(onClose)}</ReactModal>
);