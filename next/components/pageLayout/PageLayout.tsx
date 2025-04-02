import { DetailedHTMLProps, HTMLAttributes, ReactNode } from "react";
import PageHeader from "../PageHeader";
import { IconKey } from "@/hooks/useIcon";
import cn from "classnames";
import styles from "./PageLayout.module.css";
import { ChildrenPosition } from "@/types/ChildrenPosition";

interface PageLayoutProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    name: IconKey;
    translateName?: boolean;
    mainChildren?: ReactNode;
    mainChildrenPosition?: ChildrenPosition.Right | ChildrenPosition.Bottom;
    mainStyles?: string;
    headerChildrenPosition?: ChildrenPosition.Right | ChildrenPosition.Bottom;
    headerStyles?: string;
    headerChildren?: ReactNode;
    type?: 'flex' | 'block';
    headerInfo?: string;
}

export default function PageLayout({
    name, translateName = true,
    mainChildren, mainStyles,
    headerChildren, headerStyles, headerInfo,
    mainChildrenPosition = ChildrenPosition.Right,
    headerChildrenPosition = ChildrenPosition.Bottom,
    type = 'flex', className
}: PageLayoutProps) {
    return (
        <div className={cn(className, {
            [styles.flex]: type === 'flex',
            [styles.mainChildrenBottom]: mainChildrenPosition === ChildrenPosition.Bottom,
        })}>
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
            <div className={cn(styles.second, mainStyles)}>{mainChildren}</div>
        </div>
    );
}
