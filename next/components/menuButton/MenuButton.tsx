import { useIcon } from "@/hooks/useIcon";
import styles from "./MenuButton.module.css";
import cn from "classnames";

export const MenuButton = ({ isExpanded, onClick }: { isExpanded: boolean, onClick: () => void }) => {
    const icon = useIcon('menu');
    return (
        <div className={styles.container}>
            <div onClick={onClick} className={cn(styles.icon, {
                [styles.expanded]: isExpanded
            })}>
                {icon}
            </div>
        </div>
    );
};