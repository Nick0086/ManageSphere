import React from 'react'
import { cn } from '@/lib/utils'

const Spinner = ({
    color = '#fff',
    style = {},
    className = '',
    textClassName = '',
    text = ''
}) => {
    //using tailwindcss
    return (
        <div className={cn('inline-flex gap-2 items-center justify-center', className)}>
            <div aria-label="Loading..." role="status" style={{ ...style }} >
                <svg class="animate-spin w-4 h-4" viewBox="0 0 256 256" style={{ stroke: color }} >
                    <line x1="128" y1="32" x2="128" y2="64" strokeLinecap="round" strokeLinejoin="round" strokeWidth="24">
                    </line>
                    <line x1="195.9" y1="60.1" x2="173.3" y2="82.7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="24">
                    </line>
                    <line x1="224" y1="128" x2="192" y2="128" strokeLinecap="round" strokeLinejoin="round" strokeWidth="24">
                    </line>
                    <line x1="195.9" y1="195.9" x2="173.3" y2="173.3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="24">
                    </line>
                    <line x1="128" y1="224" x2="128" y2="192" strokeLinecap="round" strokeLinejoin="round" strokeWidth="24">
                    </line>
                    <line x1="60.1" y1="195.9" x2="82.7" y2="173.3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="24">
                    </line>
                    <line x1="32" y1="128" x2="64" y2="128" strokeLinecap="round" strokeLinejoin="round" strokeWidth="24">
                    </line>
                    <line x1="60.1" y1="60.1" x2="82.7" y2="82.7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="24">
                    </line>
                </svg>
            </div>
            {text && <div className={cn('text-white', textClassName)}>{text}</div>}
        </div>
    )
}

export default Spinner