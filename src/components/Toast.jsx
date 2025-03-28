// components/ToastProvider.js
import { createContext, useState, useCallback, useContext } from 'react';
import { Toast } from '@shopify/polaris';

const ToastContext = createContext();

export function ToastProvider({ children }) {
    const [active, setActive] = useState(false);
    const [content, setContent] = useState('');

    const showToast = useCallback((message) => {
        setContent(message);
        setActive(true);
    }, []);

    const hideToast = useCallback(() => {
        setActive(false);
    }, []);

    const toastMarkup = active ? (
        <Toast content={content} onDismiss={hideToast} />
    ) : null;

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {toastMarkup}
        </ToastContext.Provider>
    );
}

export function useToast() {
    return useContext(ToastContext);
}