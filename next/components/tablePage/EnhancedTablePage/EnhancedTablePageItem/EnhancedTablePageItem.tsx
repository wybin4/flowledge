import { Identifiable } from "@/types/Identifiable";
import { useRouter } from "next/navigation";
import { IconKey } from "@/hooks/useIcon";
import { TablePageMode } from "@/types/TablePageMode";
import { EnhancedItemType } from "../types/EnhancedItemTypes";
import { EnhancedItemChildren } from "../types/EnhancedItemChildren";
import styles from "./EnhancedTablePageItem.module.css";

interface EnhancedTablePageItemProps<T> {
    prefix: IconKey;
    item: T;
    mode: TablePageMode;
    itemKeys: EnhancedItemChildren[];
    onClick?: (_id: string) => void;
}

export const EnhancedTablePageItem = <T extends Identifiable>({ item, prefix, mode, itemKeys, onClick: passedOnClick }: EnhancedTablePageItemProps<T>) => {
    const router = useRouter();
    const onClick = passedOnClick ? () => passedOnClick(item._id) : () => router.push(`/${prefix}/${item._id}?mode=${mode}`);

    return (
        <tr className={styles.container} key={item._id} onClick={onClick}>
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
