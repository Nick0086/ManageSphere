import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { cva } from 'class-variance-authority';

export const tagVariants = cva('transition-all border inline-flex items-center text-sm pl-2 rounded-md', {
    variants: {
        variant: {
            default: 'bg-gray-50 text-secondary-foreground hover:bg-gray-50/80',
            primary: 'bg-gray-50 border-primary text-primary-foreground hover:bg-gray-50/90',
            destructive: 'bg-destructive border-destructive text-destructive-foreground hover:bg-destructive/90',
        },
        size: {
            sm: 'text-xs',
            md: 'text-sm',
            lg: 'text-base',
            xl: 'text-lg',
        },
        shape: {
            default: 'rounded-sm',
            rounded: 'rounded-lg',
            square: 'rounded-none',
            pill: 'rounded-full',
        },
        borderStyle: {
            default: 'border-solid',
            none: 'border-none',
        },
        textCase: {
            uppercase: 'uppercase',
            lowercase: 'lowercase',
            capitalize: 'capitalize',
        },
        interaction: {
            clickable: 'cursor-pointer hover:shadow-md',
            nonClickable: 'cursor-default',
        },
        animation: {
            none: '',
            fadeIn: 'animate-fadeIn',
            slideIn: 'animate-slideIn',
            bounce: 'animate-bounce',
        },
        textStyle: {
            normal: 'font-normal',
            bold: 'font-bold',
            italic: 'italic',
            underline: 'underline',
            lineThrough: 'line-through',
        },
    },
    defaultVariants: {
        variant: 'default',
        size: 'md',
        shape: 'default',
        borderStyle: 'default',
        interaction: 'nonClickable',
        animation: 'fadeIn',
        textStyle: 'normal',
    },
});

export const Tag = ({
    tagObj,
    direction,
    draggable,
    onTagClick,
    onRemoveTag,
    variant,
    size,
    shape,
    borderStyle,
    textCase,
    interaction,
    animation,
    textStyle,
    isActiveTag
}) => {
    return (
        <span
            key={tagObj.id}
            draggable={draggable}
            className={cn(
                tagVariants({
                    variant,
                    size,
                    shape,
                    borderStyle,
                    textCase,
                    interaction,
                    animation,
                    textStyle,
                }),
                {
                    'justify-between': direction === 'column',
                    'cursor-pointer': draggable,
                    'ring-ring ring-offset-1 ring-1 ring-offset-background': isActiveTag,
                },
            )}
            onClick={() => onTagClick?.(tagObj)}
        >
            {tagObj.text}
            <Button
                type="button"
                variant="ghost"
                onClick={(e) => {
                    e.stopPropagation(); // Prevent event from bubbling up to the tag span
                    onRemoveTag(tagObj.id);
                }}
                className={cn('py-1 px-2 h-full hover:bg-transparent hover:text-destructive')}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-x"
                >
                    <path d="M18 6 6 18"></path>
                    <path d="m6 6 12 12"></path>
                </svg>
            </Button>
        </span>
    );
};
