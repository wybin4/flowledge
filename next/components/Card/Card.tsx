import { ItemSize } from "@/types/ItemSize";
import styles from "./Card.module.css";
import cn from "classnames";
import { ReactNode } from "react";

type CardProps = {
    id?: string;
    onClick?: () => void;
    size?: ItemSize;
    dotText?: (size: ItemSize) => ReactNode;
    title: (size: ItemSize) => string | undefined;
    actions?: CardAction[];
    children?: ReactNode;
    className?: string;
    clickable?: boolean;
};

type CardAction = {
    title: string;
    onClick: () => void;
    className?: string;
};

export const Card = ({
    id, title, dotText, onClick,
    actions, children, className, clickable = true,
    size = ItemSize.Little
}: CardProps) => {
    return (
        <div
            id={id}
            onClick={onClick}
            className={cn(styles.container, className, styles[size], {
                [styles.pointer]: clickable
            })}
        >
            <div className={styles.body}>
                <div className={styles.title}>
                    {dotText && <div className={styles.dot}>{dotText(size)}</div>}
                    <div className={styles.text}>{title(size)}</div>
                </div>
                {actions && actions.map((action, index) => (
                    <div
                        key={index}
                        className={cn(action.className, styles.action)}
                        onClick={action.onClick}
                    >
                        {action.title}
                    </div>
                ))}
            </div>
            {children}
        </div>
    );
};