import React from 'react';
import './sqaureLoader.css';
import { cn } from '@/lib/utils';

const SquareLoader = ({ bodyClassName, msg, msgClass }) => {

    return (
        <div className={cn(bodyClassName, "sqaureLoader__body")}>
            <div className="wrapper">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>

            </div>
            <div className={cn(msgClass, 'mt-4 font-semibold text-lg')}> {msg}</div>
        </div>

    );
};

export default SquareLoader;
