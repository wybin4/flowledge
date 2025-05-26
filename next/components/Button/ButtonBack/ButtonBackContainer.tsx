import { ButtonBackProps } from "./ButtonBack";
import { ButtonBack } from "./ButtonBack";
import { ReactNode } from "react";
import styles from "./ButtonBack.module.css";
import cn from "classnames";
import { ChildrenPosition } from "@/types/ChildrenPosition";

export type ButtonBackContainerProps = ButtonBackProps & {
    children: (backButton?: ReactNode) => ReactNode;
    className?: string;
    type?: ChildrenPosition;
    compressBody?: boolean;
}

export const ButtonBackContainer = ({
    children,
    type = ChildrenPosition.Left,
    compressBody = true,
    className,
    ...props
}: ButtonBackContainerProps) => {
    return (
        <div className={cn(styles.container, className)}>
            {(type === ChildrenPosition.Left || type === ChildrenPosition.TopRight) && (
                <ButtonBack backButtonStyles={cn({
                    [styles.topRight]: type === ChildrenPosition.TopRight
                })} {...props} />
            )}
            <div className={cn(styles.body, {
                [styles.compressed]: compressBody,
                [styles.full]: !compressBody
            })}>
                {children(type === ChildrenPosition.Bottom ? <ButtonBack {...props} /> : undefined)}
            </div>
        </div>
    );
};  
