import { DetailedHTMLProps, HTMLAttributes, ReactNode } from "react";
import PageHeader from "../PageHeader";
import { IconKey } from "@/hooks/useIcon";
import cn from "classnames";
import styles from "./PageLayout.module.css";

interface PageLayoutProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    name: IconKey;
    translateName?: boolean;
    mainChildren: ReactNode;
    headerChildren: ReactNode;
    type?: 'flex' | 'block';
    headerInfo?: string;
}

export default function PageLayout({ name, translateName = true, mainChildren, headerChildren, headerInfo, type = 'flex', className }: PageLayoutProps) {
    return (
        <div className={cn(className, {
            [styles.flex]: type === 'flex',
        })}>
            <div className={styles.first}>
                <div className={cn({
                    [styles.headerContainer]: headerInfo
                })}>
                    <PageHeader title={translateName ? `sidebar.${name}` : name} />
                    {headerInfo && <div className={styles.headerInfo}>{headerInfo}</div>}
                </div>
                {headerChildren}
            </div>
            <div className={styles.second}>{mainChildren}</div>
        </div>
    );
}
