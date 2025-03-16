import { useState, useRef, ReactNode } from "react";

interface FocusableContainerProps {
    children: (focused: boolean) => ReactNode;
    className?: string;
}

const FocusableContainer = ({ children, className }: FocusableContainerProps) => {
    const [focused, setFocused] = useState(false);
    const divRef = useRef<HTMLDivElement>(null);

    return (
        <div
            className={className}
            ref={divRef}
            tabIndex={-1}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
        >
            {children(focused)}
        </div>
    );
};

export default FocusableContainer;
