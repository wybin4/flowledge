import { Identifiable } from '@/types/Identifiable';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import React, { ReactNode } from 'react';
import { SortableItem } from './SortableItem';
import styles from "./Sortable.module.css";
import { ChildrenPosition } from '@/types/ChildrenPosition';

type SortableListProps<T extends Identifiable> = {
    items: T[];
    setItems: (items: T[]) => void;
    renderItem: (item: T, index: number) => ReactNode;
    buttonPosition?: ChildrenPosition;
    className?: string;
};

export const SortableList = <T extends Identifiable>({
    items, setItems,
    renderItem, className,
    buttonPosition = ChildrenPosition.Right
}: SortableListProps<T>) => {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: any) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            const oldIndex = items.findIndex(item => item.id === active.id);
            const newIndex = items.findIndex(item => item.id === over.id);
            const newItems = arrayMove(items, oldIndex, newIndex);
            setItems(newItems);
        }
    };

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items.map(item => item.id)} strategy={verticalListSortingStrategy}>
                {items.map((item, index) => (
                    <SortableItem key={item.id} id={item.id} className={className}>{
                        button => (
                            <div className={styles.list}>
                                {buttonPosition === ChildrenPosition.Left && button}
                                {renderItem(item, index)}
                                {buttonPosition === ChildrenPosition.Right && button}

                            </div>
                        )
                    }
                    </SortableItem>
                ))}
            </SortableContext>
        </DndContext>
    );
};