import * as React from 'react';
import { components } from 'react-select';
import { Check, X, ChevronDown } from 'lucide-react'
import { cn } from '../../../lib/utils';

export const DropdownIndicator = (props) => {
    return (
        <components.DropdownIndicator {...props}>
            <ChevronDown className={'h-4 w-4 opacity-50'} />
        </components.DropdownIndicator>
    );
};

export const ClearIndicator = (props) => {
    return (
        <components.ClearIndicator {...props}>
            <X className={'h-3.5 w-3.5 opacity-50'} />
        </components.ClearIndicator>
    );
};

export const MultiValueRemove = (props) => {
    return (
        <components.MultiValueRemove className='bg-red-100' {...props}>
            <X className={'h-3 w-3 opacity-50'} />
        </components.MultiValueRemove>
    );
};

export const Option = (props) => {
    return (
        <components.Option {...props}>
            <div className={cn("flex items-center justify-between", props.isSelected && '')}>
                <div>{props.data.label}</div>
                {props.isSelected && <Check size={16} />}
            </div>
        </components.Option>
    );
};