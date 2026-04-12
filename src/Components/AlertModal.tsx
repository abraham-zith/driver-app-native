import React from 'react';
import { useAlert } from '../context/AlertContext';
import ConfirmationModal from './ConfirmationModal';

const AlertModal: React.FC = () => {
    const { isVisible, hideAlert, alertConfig } = useAlert();

    if (!alertConfig) return null;

    const {
        title,
        message,
        confirmText,
        cancelText,
        onConfirm,
        onCancel,
        isDestructive,
        icon,
        singleButton,
    } = alertConfig;

    const handleConfirm = () => {
        hideAlert();
        if (onConfirm) onConfirm();
    };

    const handleCancel = () => {
        hideAlert();
        if (onCancel) onCancel();
    };

    return (
        <ConfirmationModal
            isVisible={isVisible}
            onClose={handleCancel}
            onConfirm={handleConfirm}
            title={title}
            message={message}
            confirmText={confirmText}
            cancelText={cancelText}
            isDestructive={isDestructive}
            icon={icon}
            singleButton={singleButton}
        />
    );
};

export default AlertModal;
