import React from 'react';
import { Checkbox } from '../ui/checkbox';

const QrCodeCheckbox = ({ id, isSelected, onToggle }) => {
    return (
        <Checkbox
            id={`checkbox-${id}`}
            checked={isSelected}
            onCheckedChange={onToggle}
            className="h-4 w-4 border-2 border-primary rounded"
        />
    );
};

export default QrCodeCheckbox;