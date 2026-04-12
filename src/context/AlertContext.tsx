import React, { createContext, useContext, useState, useCallback } from 'react';

interface AlertOptions {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
    isDestructive?: boolean;
    icon?: string;
    singleButton?: boolean;
}

interface AlertContextData {
    showAlert: (options: AlertOptions) => void;
    hideAlert: () => void;
    alertConfig: AlertOptions | null;
    isVisible: boolean;
}

const AlertContext = createContext<AlertContextData>({} as AlertContextData);

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [alertConfig, setAlertConfig] = useState<AlertOptions | null>(null);

    const hideAlert = useCallback(() => {
        setIsVisible(false);
    }, []);

    const showAlert = useCallback((options: AlertOptions) => {
        setAlertConfig(options);
        setIsVisible(true);
    }, []);

    return (
        <AlertContext.Provider value={{ showAlert, hideAlert, alertConfig, isVisible }}>
            {children}
        </AlertContext.Provider>
    );
};

export const useAlert = () => {
    const context = useContext(AlertContext);
    if (!context) {
        throw new Error('useAlert must be used within an AlertProvider');
    }
    return context;
};
