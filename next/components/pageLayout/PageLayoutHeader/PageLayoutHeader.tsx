import PageHeader from "@/components/PageHeader";
import { ChildrenPosition } from "@/types/ChildrenPosition";
import cn from "classnames";
import styles from "./PageLayoutHeader.module.css";
import { ReactNode } from "react";
import { IconKey } from "@/hooks/useIcon";

export type PageLayoutHeaderProps = {
    name: IconKey | string;
    translateName?: boolean;
    headerChildren?: ReactNode;
    headerChildrenPosition?: ChildrenPosition;
    headerInfo?: string;
    headerStyles?: string;
}

export const PageLayoutHeader = ({
    name, translateName = false,
    headerChildren, headerChildrenPosition = ChildrenPosition.Bottom,
    headerInfo, headerStyles
}: PageLayoutHeaderProps) => {
    return (
        <div className={cn(styles.first, headerStyles, {
            [styles.headerChildrenRight]: headerChildrenPosition === ChildrenPosition.Right
        })}>
            <div className={cn({
                [styles.headerContainer]: headerInfo,
            })}>
                <PageHeader title={translateName ? `sidebar.${name}` : name} />
                {headerInfo && <div className={styles.headerInfo}>{headerInfo}</div>}
            </div>
            <div>
                {headerChildren}
            </div>
        </div>
    );
};

