'use client';

import React, { useState, useEffect } from 'react';

interface AnimatedGlowingBoxProps {
    children: React.ReactNode;
    className?: string;
}

const AnimatedGlowingBox: React.FC<AnimatedGlowingBoxProps> = ({
    children,
    className = '',
}) => {
    const [mounted, setMounted] = useState(false);
    const [isTouchDevice, setIsTouchDevice] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Detect touch device
        const checkTouchDevice = () => {
            setIsTouchDevice(
                'ontouchstart' in window ||
                navigator.maxTouchPoints > 0 ||
                window.matchMedia('(pointer: coarse)').matches
            );
        };
        checkTouchDevice();
    }, []);

    if (!mounted) {
        return <div className={className}>{children}</div>;
    }

    return (
        <div className="animated-glow-wrapper">
            <style jsx>{`
                .animated-glow-wrapper {
                    position: relative;
                    isolation: isolate;
                }
                
                .glow-container {
                    position: relative;
                }
                
                .glow-layer {
                    position: absolute;
                    z-index: 0;
                    overflow: hidden;
                    height: 100%;
                    width: 100%;
                    border-radius: 12px;
                    -webkit-border-radius: 12px;
                }
                
                .glow-layer::before {
                    content: '';
                    position: absolute;
                    z-index: 0;
                    top: 50%;
                    left: 50%;
                    background-repeat: no-repeat;
                }
                
                /* ===== DESKTOP: Static by default, rotate on hover ===== */
                @media (hover: hover) and (pointer: fine) {
                    .glow-layer::before {
                        transform: translate(-50%, -50%) rotate(60deg);
                        -webkit-transform: translate(-50%, -50%) rotate(60deg);
                        transition: transform 2s ease;
                        -webkit-transition: -webkit-transform 2s ease;
                    }
                    
                    .glow-container:hover .glow-layer::before {
                        transform: translate(-50%, -50%) rotate(-120deg);
                        -webkit-transform: translate(-50%, -50%) rotate(-120deg);
                    }
                    
                    .glow-container:hover .glow-layer-2::before,
                    .glow-container:hover .glow-layer-3::before,
                    .glow-container:hover .glow-layer-4::before {
                        transform: translate(-50%, -50%) rotate(-98deg);
                        -webkit-transform: translate(-50%, -50%) rotate(-98deg);
                    }
                    
                    .glow-container:hover .glow-layer-5::before {
                        transform: translate(-50%, -50%) rotate(-97deg);
                        -webkit-transform: translate(-50%, -50%) rotate(-97deg);
                    }
                    
                    .glow-container:hover .glow-layer-6::before {
                        transform: translate(-50%, -50%) rotate(-110deg);
                        -webkit-transform: translate(-50%, -50%) rotate(-110deg);
                    }
                    
                    .glow-layer-2::before,
                    .glow-layer-3::before,
                    .glow-layer-4::before {
                        transform: translate(-50%, -50%) rotate(82deg);
                        -webkit-transform: translate(-50%, -50%) rotate(82deg);
                    }
                    
                    .glow-layer-5::before {
                        transform: translate(-50%, -50%) rotate(83deg);
                        -webkit-transform: translate(-50%, -50%) rotate(83deg);
                    }
                    
                    .glow-layer-6::before {
                        transform: translate(-50%, -50%) rotate(70deg);
                        -webkit-transform: translate(-50%, -50%) rotate(70deg);
                    }
                }
                
                /* ===== MOBILE/TOUCH: Always rotating animation ===== */
                @media (hover: none), (pointer: coarse) {
                    .glow-layer::before {
                        animation: glow-rotate 8s linear infinite;
                        -webkit-animation: glow-rotate 8s linear infinite;
                    }
                    
                    .glow-layer-2::before,
                    .glow-layer-3::before,
                    .glow-layer-4::before {
                        animation-delay: 0.2s;
                        -webkit-animation-delay: 0.2s;
                    }
                    
                    .glow-layer-5::before {
                        animation-delay: 0.4s;
                        -webkit-animation-delay: 0.4s;
                    }
                    
                    .glow-layer-6::before {
                        animation-delay: 0.1s;
                        -webkit-animation-delay: 0.1s;
                    }
                }
                
                @keyframes glow-rotate {
                    from {
                        transform: translate(-50%, -50%) rotate(0deg);
                    }
                    to {
                        transform: translate(-50%, -50%) rotate(360deg);
                    }
                }
                
                @-webkit-keyframes glow-rotate {
                    from {
                        -webkit-transform: translate(-50%, -50%) rotate(0deg);
                    }
                    to {
                        -webkit-transform: translate(-50%, -50%) rotate(360deg);
                    }
                }
                
                /* Layer 1 - Main glow */
                .glow-layer-1 {
                    filter: blur(3px);
                    -webkit-filter: blur(3px);
                }
                
                .glow-layer-1::before {
                    width: 999px;
                    height: 999px;
                    background: conic-gradient(#000, #402fb5 5%, #000 38%, #000 50%, #cf30aa 60%, #000 87%);
                }
                
                /* Layer 2-4 - Secondary glows */
                .glow-layer-2,
                .glow-layer-3,
                .glow-layer-4 {
                    filter: blur(3px);
                    -webkit-filter: blur(3px);
                }
                
                .glow-layer-2::before,
                .glow-layer-3::before,
                .glow-layer-4::before {
                    width: 600px;
                    height: 600px;
                    background: conic-gradient(rgba(0,0,0,0), #18116a, rgba(0,0,0,0) 10%, rgba(0,0,0,0) 50%, #6e1b60, rgba(0,0,0,0) 60%);
                }
                
                /* Layer 5 - Bright glow */
                .glow-layer-5 {
                    filter: blur(2px);
                    -webkit-filter: blur(2px);
                    border-radius: 8px;
                    -webkit-border-radius: 8px;
                }
                
                .glow-layer-5::before {
                    width: 600px;
                    height: 600px;
                    background: conic-gradient(rgba(0,0,0,0) 0%, #a099d8, rgba(0,0,0,0) 8%, rgba(0,0,0,0) 50%, #dfa2da, rgba(0,0,0,0) 58%);
                    filter: brightness(1.4);
                    -webkit-filter: brightness(1.4);
                }
                
                /* Layer 6 - Sharp edge */
                .glow-layer-6 {
                    filter: blur(0.5px);
                    -webkit-filter: blur(0.5px);
                }
                
                .glow-layer-6::before {
                    width: 600px;
                    height: 600px;
                    background: conic-gradient(#1c191c, #402fb5 5%, #1c191c 14%, #1c191c 50%, #cf30aa 60%, #1c191c 64%);
                    filter: brightness(1.3);
                    -webkit-filter: brightness(1.3);
                }
                
                .glow-content {
                    position: relative;
                    z-index: 10;
                }
            `}</style>

            <div className="glow-container">
                {/* Glow layers */}
                <div className="glow-layer glow-layer-1" />
                <div className="glow-layer glow-layer-2" />
                <div className="glow-layer glow-layer-3" />
                <div className="glow-layer glow-layer-4" />
                <div className="glow-layer glow-layer-5" />
                <div className="glow-layer glow-layer-6" />

                {/* Content wrapper */}
                <div className={`glow-content ${className}`}>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default AnimatedGlowingBox;
