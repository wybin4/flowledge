import { useIcon } from "@/hooks/useIcon";
import styles from "./MenuButton.module.css";
import cn from "classnames";
import { ItemSize } from "@/types/ItemSize";

type MenuButtonProps = {
    isExpanded: boolean;
    onClick: () => void;
    size?: ItemSize;
};

export const MenuButton = ({ isExpanded, onClick, size = ItemSize.Big }: MenuButtonProps) => {
    const icon = useIcon('menu');
    return (
        <div className={cn(styles.container, styles[size])}>
            <div onClick={onClick} className={cn(styles.icon, {
                [styles.expanded]: isExpanded
            })}>
                {icon}
            </div>
        </div>
    );
};