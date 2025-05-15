import { ReactNode } from "react";
import styles from "./RightSidebarWithStickyActions.module.css";
import cn from "classnames";
import RightSidebar, { RightSidebarClassNames } from "../RightSidebar";
import { StickyBottomBar } from "@/components/StickyBottomBar/StickyBottomBar";
import { ItemSize } from "@/types/ItemSize";
import { MenuButton } from "@/components/MenuButton/MenuButton";

type RightSidebarWithStickyActionsProps = {
    sidebar: {
        title: ReactNode;
        body: (classNames: RightSidebarClassNames) => ReactNode;
        containerClassName?: string;
    };
    stickyBottomBar: {
        actions: ReactNode;
        menuSize: ItemSize;
        body: ReactNode;
    }
};

export const RightSidebarWithStickyActions = ({ sidebar, stickyBottomBar }: RightSidebarWithStickyActionsProps) => {
    return (
        <RightSidebar content={classNames =>
            <div className={cn(styles.container, sidebar.containerClassName)}>
                <div className={cn(styles.titleContainer, styles.mt)}>
                    {sidebar.title}
                </div>
                {sidebar.body(classNames)}
            </div>
        }>{(isExpanded, toggleSidebar) => (
            <div className={cn(styles.container, {
                [styles.expanded]: isExpanded
            })}>
                <StickyBottomBar barContent={
                    <div className={styles.buttonContainer}>
                        {stickyBottomBar.actions}
                    </div>
                }>
                    <div className={cn(styles.titleContainer, styles.mb)}>
                        <div></div>
                        <MenuButton size={stickyBottomBar.menuSize} isExpanded={isExpanded} onClick={toggleSidebar} />
                    </div>
                    {stickyBottomBar.body}
                </StickyBottomBar>
            </div>
        )}</RightSidebar>
    );
};