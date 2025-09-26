/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SearchContextType {
    isOpen: boolean;
    openSearchModal: () => void;
    closeSearchModal: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const openSearchModal = () => setIsOpen(true);
    const closeSearchModal = () => setIsOpen(false);
    return (
        <SearchContext.Provider value={{ isOpen, openSearchModal, closeSearchModal }}>
            {children}
        </SearchContext.Provider>
    );
};

export const useSearch = () => {
    const context = useContext(SearchContext);
    if (!context) throw new Error('useModal must be used within ModalProvider');
    return context;
};
