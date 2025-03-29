import { DetailedHTMLProps, HTMLAttributes, ReactNode } from "react";
import PageHeader from "../PageHeader";
import { IconKey } from "@/hooks/useIcon";
import cn from "classnames";
import styles from "./PageLayout.module.css";

interface PageLayoutProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    name: IconKey;
    translateName?: boolean;
    mainChildren?: ReactNode;
    headerChildrenPosition?: 'bottom' | 'right';
    headerStyles?: string;
    headerChildren?: ReactNode;
    type?: 'flex' | 'block';
    headerInfo?: string;
}

export default function PageLayout({
    name, translateName = true,
    mainChildren,
    headerChildren, headerChildrenPosition = 'bottom', headerStyles, headerInfo,
    type = 'flex', className
}: PageLayoutProps) {
    return (
        <div className={cn(className, {
            [styles.flex]: type === 'flex',
        })}>
            <div className={cn(styles.first, headerStyles, {
                [styles.headerChildrenRight]: headerChildrenPosition === 'right'
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
            <div className={styles.second}>{mainChildren}</div>
        </div>
    );
}
