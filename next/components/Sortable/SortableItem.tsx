import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import React, { ReactNode } from 'react';
import styles from "./Sortable.module.css";
import { useIcon } from '@/hooks/useIcon';

type SortableItemProps = {
    id: string;
    children: (node: ReactNode) => ReactNode;
    className?: string;
};

export const SortableItem = ({ id, children, className }: SortableItemProps) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
    const draggableIcon = useIcon('draggable');

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} className={className} style={style} {...attributes}>
            {children(<div className={styles.icon} {...listeners}>{draggableIcon}</div>)}
        </div>
    );
};