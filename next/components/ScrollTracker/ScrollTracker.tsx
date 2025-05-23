import React, { useState, useEffect, useRef, ReactNode, Dispatch, SetStateAction } from 'react';
import { throttle } from 'lodash';
import cn from "classnames";
import styles from "./ScrollTracker.module.css";

type ScrollTrackerProps = {
    children: ReactNode;
    className?: string;
    setScrollPercent: (percent: number) => void;
};

export const ScrollTracker = ({ children, className, setScrollPercent }: ScrollTrackerProps) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;

        if (!container) return;

        const handleScroll = throttle(() => {
            const scrollHeight = container.scrollHeight;
            const clientHeight = container.clientHeight;
            const scrollTop = container.scrollTop;

            const percent = (scrollTop / (scrollHeight - clientHeight)) * 100;
            setScrollPercent(percent);
        }, 100);

        container.addEventListener('scroll', handleScroll);

        return () => {
            container.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <div ref={containerRef} className={cn(className, styles.scroll)}>
            {children}
        </div>
    );
};