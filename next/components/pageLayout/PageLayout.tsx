import { DetailedHTMLProps, HTMLAttributes, ReactNode } from "react";
import PageHeader from "../PageHeader";
import { IconKey } from "@/hooks/useIcon";
import cn from "classnames";
import styles from "./PageLayout.module.css";
import { ChildrenPosition } from "@/types/ChildrenPosition";
import { PageLayoutHeader, PageLayoutHeaderProps } from "./PageLayoutHeader/PageLayoutHeader";

interface PageLayoutProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    name: IconKey;
    translateName?: boolean;
    mainChildren?: ReactNode;
    mainChildrenPosition?: ChildrenPosition.Right | ChildrenPosition.Bottom;
    mainStyles?: string;
    type?: 'flex' | 'block';
    headerProps?: Omit<PageLayoutHeaderProps, 'name' | 'translateName'>;
}

export default function PageLayout({
    name, translateName = true,
    mainChildren, mainStyles,
    headerProps,
    mainChildrenPosition = ChildrenPosition.Right,
    type = 'flex', className
}: PageLayoutProps) {
    return (
        <div className={cn(className, {
            [styles.flex]: type === 'flex',
            [styles.mainChildrenBottom]: mainChildrenPosition === ChildrenPosition.Bottom,
        })}>
            <PageLayoutHeader
                name={name}
                translateName={translateName}
                {...headerProps}
            />
            <div className={cn(styles.second, mainStyles)}>{mainChildren}</div>
        </div>
    );
}
