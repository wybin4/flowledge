import { ButtonBackProps } from "./ButtonBack";
import { ButtonBack } from "./ButtonBack";
import { ReactNode } from "react";
import styles from "./ButtonBack.module.css";
import cn from "classnames";

type ButtonBackContainerProps = ButtonBackProps & {
    children: ReactNode;
    className?: string;
}

export const ButtonBackContainer = ({ children, className, ...props }: ButtonBackContainerProps) => {
    return (
        <div className={cn(styles.container, className)}>
            <ButtonBack {...props} />
            <div className={styles.body}>
                {children}
            </div>
        </div>
    );
};  
