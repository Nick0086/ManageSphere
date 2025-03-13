// src/contexts/TemplateContext.jsx
import { DEFAULT_THEME } from '@/components/Menu/Templates/utils';
import React, { createContext, useContext, useState, useMemo } from 'react';

const TemplateContext = createContext(null);



export function TemplateProvider({ children }) {
    // Initialize all state with default values
    const [backgroundColor, setBackgroundColor] = useState(DEFAULT_THEME.backgroundColor);
    const [sectionBackgroundColor, setSectionBackgroundColor] = useState(DEFAULT_THEME.sectionBackgroundColor);
    const [titleColor, setTitleColor] = useState(DEFAULT_THEME.titleColor);
    const [cardTitleColor, setCardTitleColor] = useState(DEFAULT_THEME.cardTitleColor);
    const [cardBackgroundColor, setCardBackgroundColor] = useState(DEFAULT_THEME.cardBackgroundColor);
    const [descriptionColor, setDescriptionColor] = useState(DEFAULT_THEME.descriptionColor);
    const [buttonBackgroundColor, setButtonBackgroundColor] = useState(DEFAULT_THEME.buttonBackgroundColor);
    const [buttonLabelColor, setButtonLabelColor] = useState(DEFAULT_THEME.buttonLabelColor);

    // Reset handler that uses default values
    const resetAllHandler = () => {
        setBackgroundColor(DEFAULT_THEME.backgroundColor);
        setSectionBackgroundColor(DEFAULT_THEME.sectionBackgroundColor);
        setTitleColor(DEFAULT_THEME.titleColor);
        setCardTitleColor(DEFAULT_THEME.cardTitleColor);
        setCardBackgroundColor(DEFAULT_THEME.cardBackgroundColor);
        setDescriptionColor(DEFAULT_THEME.descriptionColor);
        setButtonBackgroundColor(DEFAULT_THEME.buttonBackgroundColor);
        setButtonLabelColor(DEFAULT_THEME.buttonLabelColor);
    };

    // Use memoized context value to prevent unnecessary re-renders
    const value = useMemo(() => ({
        // Colors
        backgroundColor,
        setBackgroundColor,
        sectionBackgroundColor,
        setSectionBackgroundColor,
        titleColor,
        setTitleColor,
        cardTitleColor,
        setCardTitleColor,
        cardBackgroundColor,
        setCardBackgroundColor,
        descriptionColor,
        setDescriptionColor,
        buttonBackgroundColor,
        setButtonBackgroundColor,
        buttonLabelColor,
        setButtonLabelColor,
        // Methods
        resetAllHandler
    }), [
        backgroundColor,
        sectionBackgroundColor,
        titleColor,
        cardTitleColor,
        cardBackgroundColor,
        descriptionColor,
        buttonBackgroundColor,
        buttonLabelColor
    ]);

    return (
        <TemplateContext.Provider value={value}>
            {children}
        </TemplateContext.Provider>
    );
}

export const useTemplate = () => {
    const context = useContext(TemplateContext);
    if (context === null) {
        throw new Error('useTemplate must be used within a TemplateProvider');
    }
    return context;
};