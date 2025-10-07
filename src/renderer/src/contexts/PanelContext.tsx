/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
// PanelContext.tsx
import { createContext, useContext, useState, ReactNode } from "react";

type PanelContextType = {
    isOpen: boolean;
    openPanel: () => void;
    closePanel: () => void;
    togglePanel: () => void;
};

const PanelContext = createContext<PanelContextType | null>(null);

export const PanelProvider = ({ children }: { children: ReactNode }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <PanelContext.Provider
            value={{
                isOpen,
                openPanel: () => setIsOpen(true),
                closePanel: () => setIsOpen(false),
                togglePanel: () => setIsOpen((v) => !v),
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
