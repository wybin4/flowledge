import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import React, { ReactNode } from 'react';
import styles from "./Sortable.module.css";
import { useIcon } from '@/hooks/useIcon';

type SortableItemProps = {
    id: string;
    children: (node: ReactNode) => ReactNode;
};

export const SortableItem = ({ id, children }: SortableItemProps) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
    const draggableIcon = useIcon('draggable');

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes}>
            {children(<div className={styles.icon} {...listeners}>{draggableIcon}</div>)}
        </div>
    );
};