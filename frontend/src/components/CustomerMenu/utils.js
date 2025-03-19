import { useMemo } from "react";
import { DEFAULT_SECTION_THEME } from "../Menu/Templates/utils";

export const customerMenuQueryKeyLoopUp = {
    'TEMPLATE': 'customer-menu-template',
    'MENU_ITEMS': 'customer-menu-items',
    'CATEGORY': 'customer-menu-catgeory',
}

export const visibleHandler = (value) => {
    if (value === false) {
        return false;
    }
    return true
}

export const useMenuStyles = (globalConfig, categoryStyle) => {
    return useMemo(() => {
        const cs = categoryStyle || {};
        const gc = globalConfig || {};
        const ds = DEFAULT_SECTION_THEME;

        return {
            sectionStyle: {
                backgroundColor: cs.section_background_color || gc.section_background_color || ds.section_background_color,
            },
            titleBarStyle: {
                color: cs.title_color || gc.title_color || ds.title_color,
            },
            titleTextStyle: {
                color: cs.title_color || gc.title_color || ds.title_color,
            },
            cardStyle: {
                backgroundColor: cs.card_background_color || gc.card_background_color || ds.card_background_color,
            },
            titleStyle: {
                color: cs.card_title_color || gc.card_title_color || ds.card_title_color,
            },
            descriptionStyle: {
                color: cs.description_color || gc.description_color || ds.description_color,
            },
            buttonBackgroundStyle: {
                backgroundColor: cs.button_background_color || gc.button_background_color || ds.button_background_color,
            },
            buttonLabelStyle: {
                color: cs.button_label_color || gc.button_label_color || ds.button_label_color,
            },
        };
    }, [globalConfig, categoryStyle]);
};