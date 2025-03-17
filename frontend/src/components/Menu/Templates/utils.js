export const templateQueryKeyLoopUp = {
    'TEMPLATE_LIST': 'all-templates-list',
    'TEMPLATE_CATEGORY_LIST': 'template-category-list',
    'TEMPLATE_ITEM_LIST': 'template-item-list'
}

// Default theme values
export const DEFAULT_THEME = {
    backgroundColor: '#f4f5f7',
    sectionBackgroundColor: '#ffffff',
    titleColor: '#1e2939',
    cardTitleColor: '#1e2939',
    cardBackgroundColor: '#ffffff',
    descriptionColor: '#4a5565',
    buttonBackgroundColor: '#615FFF',
    buttonLabelColor: '#ffffff'
};

export const DEFAULT_SECTION_THEME = {
    "section_background_color": DEFAULT_THEME.sectionBackgroundColor,
    "title_color": DEFAULT_THEME.titleColor,
    "card_title_color": DEFAULT_THEME.cardTitleColor,
    "card_background_color": DEFAULT_THEME.cardBackgroundColor,
    "description_color": DEFAULT_THEME.descriptionColor,
    "button_label_color": DEFAULT_THEME.buttonLabelColor,
    "button_background_color": DEFAULT_THEME.buttonBackgroundColor
}

export const templateDefaultValue = {
    "global": {
        "background_color": DEFAULT_THEME.backgroundColor,
        "section_background_color": DEFAULT_THEME.sectionBackgroundColor,
        "title_color": DEFAULT_THEME.titleColor,
        "card_title_color": DEFAULT_THEME.cardTitleColor,
        "card_background_color": DEFAULT_THEME.cardBackgroundColor,
        "description_color": DEFAULT_THEME.descriptionColor,
        "button_label_color": DEFAULT_THEME.buttonLabelColor,
        "button_background_color": DEFAULT_THEME.buttonBackgroundColor
    },
    "categories": [],
    "styling": {
        "borderRadius": "8px",
        "shadow": "0 2px 4px rgba(0,0,0,0.1)"
    }
}

