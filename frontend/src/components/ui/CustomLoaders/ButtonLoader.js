import React from 'react'

const ButtonLoader = ({ height, width }) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={width || "25"} height={height || "25"} viewBox="0 0 100 100" preserveAspectRatio="xMidYMid">
            <g transform="rotate(0 50 50)">
                <rect x="43" y="9.5" rx="3.7800000000000002" ry="3.7800000000000002" width="14" height="9" fill="#ffffff">
                    <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="0.78125s" begin="-0.7161458333333334s" repeatCount="indefinite"></animate>
                </rect>
            </g><g transform="rotate(30 50 50)">
                <rect x="43" y="9.5" rx="3.7800000000000002" ry="3.7800000000000002" width="14" height="9" fill="#ffffff">
                    <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="0.78125s" begin="-0.6510416666666667s" repeatCount="indefinite"></animate>
                </rect>
            </g><g transform="rotate(60 50 50)">
                <rect x="43" y="9.5" rx="3.7800000000000002" ry="3.7800000000000002" width="14" height="9" fill="#ffffff">
                    <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="0.78125s" begin="-0.5859375s" repeatCount="indefinite"></animate>
                </rect>
            </g><g transform="rotate(90 50 50)">
                <rect x="43" y="9.5" rx="3.7800000000000002" ry="3.7800000000000002" width="14" height="9" fill="#ffffff">
                    <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="0.78125s" begin="-0.5208333333333334s" repeatCount="indefinite"></animate>
                </rect>
            </g><g transform="rotate(120 50 50)">
                <rect x="43" y="9.5" rx="3.7800000000000002" ry="3.7800000000000002" width="14" height="9" fill="#ffffff">
                    <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="0.78125s" begin="-0.4557291666666667s" repeatCount="indefinite"></animate>
                </rect>
            </g><g transform="rotate(150 50 50)">
                <rect x="43" y="9.5" rx="3.7800000000000002" ry="3.7800000000000002" width="14" height="9" fill="#ffffff">
                    <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="0.78125s" begin="-0.390625s" repeatCount="indefinite"></animate>
                </rect>
            </g><g transform="rotate(180 50 50)">
                <rect x="43" y="9.5" rx="3.7800000000000002" ry="3.7800000000000002" width="14" height="9" fill="#ffffff">
                    <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="0.78125s" begin="-0.32552083333333337s" repeatCount="indefinite"></animate>
                </rect>
            </g><g transform="rotate(210 50 50)">
                <rect x="43" y="9.5" rx="3.7800000000000002" ry="3.7800000000000002" width="14" height="9" fill="#ffffff">
                    <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="0.78125s" begin="-0.2604166666666667s" repeatCount="indefinite"></animate>
                </rect>
            </g><g transform="rotate(240 50 50)">
                <rect x="43" y="9.5" rx="3.7800000000000002" ry="3.7800000000000002" width="14" height="9" fill="#ffffff">
                    <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="0.78125s" begin="-0.1953125s" repeatCount="indefinite"></animate>
                </rect>
            </g><g transform="rotate(270 50 50)">
                <rect x="43" y="9.5" rx="3.7800000000000002" ry="3.7800000000000002" width="14" height="9" fill="#ffffff">
                    <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="0.78125s" begin="-0.13020833333333334s" repeatCount="indefinite"></animate>
                </rect>
            </g><g transform="rotate(300 50 50)">
                <rect x="43" y="9.5" rx="3.7800000000000002" ry="3.7800000000000002" width="14" height="9" fill="#ffffff">
                    <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="0.78125s" begin="-0.06510416666666667s" repeatCount="indefinite"></animate>
                </rect>
            </g><g transform="rotate(330 50 50)">
                <rect x="43" y="9.5" rx="3.7800000000000002" ry="3.7800000000000002" width="14" height="9" fill="#ffffff">
                    <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="0.78125s" begin="0s" repeatCount="indefinite"></animate>
                </rect>
            </g>
        </svg>
    )
}

export default ButtonLoader