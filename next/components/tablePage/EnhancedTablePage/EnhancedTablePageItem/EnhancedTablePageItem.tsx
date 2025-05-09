import { Identifiable } from "@/types/Identifiable";
import { useRouter } from "next/navigation";
import { IconKey } from "@/hooks/useIcon";
import { TablePageMode } from "@/types/TablePageMode";
import { EnhancedItemType } from "../types/EnhancedItemTypes";
import { EnhancedItemChildren } from "../types/EnhancedItemChildren";
import styles from "./EnhancedTablePageItem.module.css";
import cn from "classnames";

interface EnhancedTablePageItemProps<T> {
    prefix: IconKey;
    item: T;
    mode: TablePageMode;
    itemKeys: EnhancedItemChildren[];
    onClick?: (_id: string) => void;
    isItemClickable: boolean;
}

export const EnhancedTablePageItem = <T extends Identifiable>({
    item, isItemClickable,
    prefix, mode,
    itemKeys,
    onClick: passedOnClick
}: EnhancedTablePageItemProps<T>) => {
    const router = useRouter();
    const onClick = passedOnClick ? () => passedOnClick(item._id) : () => router.push(`/${prefix}/${item._id}?mode=${mode}`);

    return (
        <tr className={cn(styles.container, {
            [styles.pointer]: isItemClickable
        })} onClick={isItemClickable ? onClick : undefined}>
            {itemKeys.map((key) => (
                <td key={key.name}>
                    {
                        key.type === EnhancedItemType.Image
                            ? <img src={(item as any)[key.name]} alt={key.name} className={styles.image} />
                            : (item as any)[key.name]
                    }
                </td>
            ))}
        </tr>
    );
};
