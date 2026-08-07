/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
// PanelContext.tsx
import { createContext, useContext, useState, ReactNode } from "react";

export type PanelType = 'info' | 'chat';

type PanelContextType = {
    isOpen: boolean;
    panelType: PanelType;
    openPanel: (type?: PanelType) => void;
    closePanel: () => void;
    togglePanel: (type?: PanelType) => void;
};

const PanelContext = createContext<PanelContextType | null>(null);

export const PanelProvider = ({ children }: { children: ReactNode }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [panelType, setPanelType] = useState<PanelType>('info');

    return (
        <PanelContext.Provider
            value={{
                isOpen,
                panelType,
                openPanel: (type = 'info') => {
                    setPanelType(type)
                    setIsOpen(true)
                },
                closePanel: () => setIsOpen(false),
                togglePanel: (type = 'info') => {
                    setPanelType(type)
                    setIsOpen((v) => (type === panelType ? !v : true))
                },
            }}
        >
            {children}
        </PanelContext.Provider>
    );
};

export const usePanel = () => {
    const ctx = useContext(PanelContext);
    if (!ctx) throw new Error("usePanel must be used inside PanelProvider");
    return ctx;
};
