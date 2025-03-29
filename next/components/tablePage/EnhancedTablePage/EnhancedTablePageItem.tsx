import { Identifiable } from "@/types/Identifiable";
import { useRouter } from "next/navigation";
import { IconKey } from "@/hooks/useIcon";
import { TablePageMode } from "@/types/TablePageMode";

interface EnhancedTablePageItemProps<T> {
    prefix: IconKey;
    item: T;
    mode: TablePageMode;
    itemKeys: string[];
}

export const EnhancedTablePageItem = <T extends Identifiable>({ item, prefix, mode, itemKeys }: EnhancedTablePageItemProps<T>) => {
    const router = useRouter();
    const onClick = () => router.push(`/${prefix}/${item._id}?mode=${mode}`);
    return (
        <tr key={item._id} onClick={onClick}>
            {itemKeys.map((key) => (
                <td key={key}>{(item as any)[key]}</td>
            ))}
        </tr>
    );
};
