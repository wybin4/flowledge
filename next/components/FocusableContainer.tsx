import { useState, useRef, ReactNode } from "react";

interface FocusableContainerProps {
    children: (focused: boolean) => ReactNode;
    className?: string;
    disabled?: boolean;
}

const FocusableContainer = ({ children, className, disabled }: FocusableContainerProps) => {
    const [focused, setFocused] = useState(false);
    const divRef = useRef<HTMLDivElement>(null);

    return (
        <div
            className={className}
            ref={divRef}
            tabIndex={-1}
            onFocus={() => !disabled ? setFocused(true) : undefined}
            onBlur={() => setFocused(false)}
        >
            {children(focused)}
        </div>
    );
};

export default FocusableContainer;
