'use client';

import React, { useState, useEffect } from 'react';

interface AnimationPathProps {
    lineCount?: 2 | 4;
    direction?: 'down' | 'up';
    flip?: boolean;
    strokeColor?: string;
    beamColor?: string;
    animationDelay?: number;
    className?: string;
}

// Path definitions for each channel
const PATHS = {
    outer1: "M 31 10 v 15 q 0 5 5 5 h 59 q 5 0 5 5 v 10",
    inner1: "M 77 10 v 10 q 0 5 5 5 h 13 q 5 0 5 5 v 10",
    inner2: "M 124 10 v 10 q 0 5 -5 5 h -14 q -5 0 -5 5 v 10",
    outer2: "M 170 10 v 15 q 0 5 -5 5 h -60 q -5 0 -5 5 v 10",
};

// Extended paths for light animation (longer v distance)
const LIGHT_PATHS = {
    outer1: "M 31 10 v 15 q 0 5 5 5 h 59 q 5 0 5 5 v 25",
    inner1: "M 77 10 v 10 q 0 5 5 5 h 13 q 5 0 5 5 v 25",
    inner2: "M 124 10 v 10 q 0 5 -5 5 h -14 q -5 0 -5 5 v 25",
    outer2: "M 170 10 v 15 q 0 5 -5 5 h -60 q -5 0 -5 5 v 25",
};

export function AnimationPath({
    lineCount = 4,
    direction = 'down',
    flip = false,
    strokeColor = '#3f3f46',
    beamColor = '#00A6F5',
    animationDelay = 1,
    className = '',
}: AnimationPathProps) {
    const [mounted, setMounted] = useState(false);
    const uniqueId = React.useId();

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    // Determine which paths to use based on lineCount
    const activePaths = lineCount === 4
        ? [
            { key: 'outer1', path: PATHS.outer1, lightPath: LIGHT_PATHS.outer1, delay: 0 },
            { key: 'inner1', path: PATHS.inner1, lightPath: LIGHT_PATHS.inner1, delay: 0.3 },
            { key: 'inner2', path: PATHS.inner2, lightPath: LIGHT_PATHS.inner2, delay: 0.6 },
            { key: 'outer2', path: PATHS.outer2, lightPath: LIGHT_PATHS.outer2, delay: 0.9 },
        ]
        : [
            { key: 'outer1', path: PATHS.outer1, lightPath: LIGHT_PATHS.outer1, delay: 0 },
            { key: 'outer2', path: PATHS.outer2, lightPath: LIGHT_PATHS.outer2, delay: 0.5 },
        ];

    // Calculate transform based on direction and flip
    const getTransform = () => {
        const transforms: string[] = [];
        if (direction === 'up') transforms.push('scaleY(-1)');
        if (flip) transforms.push('scaleY(-1)');
        return transforms.length > 0 ? transforms.join(' ') : undefined;
    };

    const transform = getTransform();
    // Reverse animation when flipped or direction is up
    const shouldReverse = flip || direction === 'up';

    return (
        <>
            <style dangerouslySetInnerHTML={{
                __html: `
                    @keyframes beam-animation-${uniqueId.replace(/:/g, '')} {
                        0% { offset-distance: ${shouldReverse ? '100%' : '0%'}; }
                        100% { offset-distance: ${shouldReverse ? '0%' : '100%'}; }
                    }
                `
            }} />

            <div
                className={`relative flex w-full flex-col items-center ${className}`}
                style={{ transform }}
            >
                <svg
                    className="h-full sm:w-full"
                    width="100%"
                    height="100%"
                    viewBox="0 10 200 30"
                >
                    {/* Stroke Paths */}
                    <g
                        stroke={strokeColor}
                        fill="none"
                        strokeWidth="0.4"
                        strokeDasharray="100 100"
                        pathLength={100}
                    >
                        {activePaths.map(({ key, path }) => (
                            <path key={key} d={path} />
                        ))}
                        <animate
                            attributeName="stroke-dashoffset"
                            from="100"
                            to="0"
                            dur="1s"
                            fill="freeze"
                            calcMode="spline"
                            keySplines="0.25,0.1,0.5,1"
                            keyTimes="0; 1"
                        />
                    </g>

                    {/* Beam Lights */}
                    {activePaths.map(({ key, lightPath, delay }) => (
                        <g key={`light-${key}`} mask={`url(#mask-${uniqueId}-${key})`}>
                            <circle
                                cx="0"
                                cy="0"
                                r="12"
                                fill={`url(#grad-${uniqueId})`}
                                style={{
                                    offsetPath: `path("${lightPath}")`,
                                    offsetAnchor: '10px 0px',
                                    animation: `beam-animation-${uniqueId.replace(/:/g, '')} 4s cubic-bezier(0, 0, 0.2, 1) infinite`,
                                    animationDelay: `${animationDelay + delay}s`
                                }}
                            />
                        </g>
                    ))}

                    <defs>
                        {/* Masks for each path */}
                        {activePaths.map(({ key, path }) => (
                            <mask key={`mask-${key}`} id={`mask-${uniqueId}-${key}`}>
                                <path
                                    d={path}
                                    strokeWidth="0.5"
                                    stroke="white"
                                />
                            </mask>
                        ))}

                        {/* Radial Gradient for beam */}
                        <radialGradient id={`grad-${uniqueId}`} fx="1">
                            <stop offset="0%" stopColor={beamColor} />
                            <stop offset="100%" stopColor="transparent" />
                        </radialGradient>
                    </defs>
                </svg>
            </div>
        </>
    );
}

export default AnimationPath;
