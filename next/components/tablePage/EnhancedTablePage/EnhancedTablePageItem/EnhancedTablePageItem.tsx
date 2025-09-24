import { Identifiable } from "@/types/Identifiable";
import { useRouter } from "next/navigation";
import { IconKey } from "@/hooks/useIcon";
import { TablePageMode } from "@/types/TablePageMode";
import { EnhancedItemType } from "../types/EnhancedItemTypes";
import { EnhancedItemChildren } from "../types/EnhancedItemChildren";
import styles from "./EnhancedTablePageItem.module.css";
import cn from "classnames";
import { Image } from "@/components/Image/Image";

interface EnhancedTablePageItemProps<T> {
    prefix: IconKey;
    item: T;
    mode: TablePageMode;
    itemKeys: EnhancedItemChildren[];
    onClick?: (id: string) => void;
    isItemClickable: boolean;
}

export const EnhancedTablePageItem = <T extends Identifiable>({
    item, isItemClickable,
    prefix, mode,
    itemKeys,
    onClick: passedOnClick
}: EnhancedTablePageItemProps<T>) => {
    const router = useRouter();
    const onClick = passedOnClick ? () => passedOnClick(item.id) : () => router.push(`/${prefix}/${item.id}?mode=${mode}`);

    const getValueByKeys = (item: any, keys: string[]): string | undefined => {
        for (const key of keys) {
            if (item[key]) {
                return item[key];
            }
        }
        return undefined;
    };

    return (
        <tr className={cn(styles.container, {
            [styles.pointer]: isItemClickable
        })} onClick={isItemClickable ? onClick : undefined}>
            {itemKeys.map((key) => (
                <td key={key.name}>
                    {
                        key.type === EnhancedItemType.Image
                            ? (
                                <Image
                                    src={(item as any)[key.name]}
                                    alt={getValueByKeys(item, ['username', 'name', 'title']) || ''}
                                    className={styles.image}
                                />
                            )
                            : (item as any)[key.name]
                    }
                </td>
            ))}
        </tr>
    );
};
