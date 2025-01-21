import React from 'react'
import './loader.css'
import { cn } from '@/lib/utils';

export default function Loader({classname}) {
    return (
        <div className={cn(`flex justify-center w-full items-center h-[70dvh]`,classname)} >
            <div className="wrapper">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
            </div>
        </div>

    );
}
