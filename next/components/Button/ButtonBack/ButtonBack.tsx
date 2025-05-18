import { t } from "i18next";
import { ReactNode } from "react";
import cn from "classnames";
import styles from "./ButtonBack.module.css";
import { useIcon } from "@/hooks/useIcon";
import { useRouter } from "next/navigation";

export type ButtonBackProps = {
    onBackButtonClick?: () => void;
    backButtonIcon?: ReactNode;
    hasBackButtonIcon?: boolean;
    hasBackButtonText?: boolean;
    backButtonText?: string;
    backButtonStyles?: string;
    isBackWithRouter?: boolean;
}

export const ButtonBack = ({
    backButtonText, hasBackButtonText = true,
    onBackButtonClick,
    backButtonIcon, hasBackButtonIcon = true,
    backButtonStyles,
    isBackWithRouter = true,
}: ButtonBackProps) => {
    const router = useRouter();
    const iconArrowLeft = useIcon('left');

    return (
        <div className={cn(styles.backButton, backButtonStyles, {
            [styles.mb]: hasBackButtonIcon
        })} onClick={() => {
            onBackButtonClick?.();
            if (isBackWithRouter) {
                router.back();
            }
        }}>
            {hasBackButtonIcon ? backButtonIcon ? backButtonIcon : iconArrowLeft : undefined} {hasBackButtonText ? backButtonText ? backButtonText : t('back') : ''}
        </div>
    );
}
