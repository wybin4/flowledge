import { ItemSize } from "@/types/ItemSize";
import styles from "./Card.module.css";
import cn from "classnames";
import { ReactNode } from "react";

type CardContainerProps = {
    id?: string;
    onClick?: () => void;
    size?: ItemSize;
    children: ReactNode;
    className?: string;
    clickable?: boolean;
};

export const CardContainer = ({
    id, onClick,
    children, className, clickable = true,
    size = ItemSize.Little
}: CardContainerProps) => {
    return (
        <div
            id={id}
            onClick={onClick}
            className={cn(styles.container, className, styles[size], {
                [styles.pointer]: clickable
            })}
        >
            {children}
        </div>
    );
};