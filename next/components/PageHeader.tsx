"use client";

import { memo } from "react";
import { useTranslation } from "react-i18next";

type PageHeaderProps = {
    title: string;
}

const PageHeader = memo(({ title }: PageHeaderProps) => {
    const { t } = useTranslation();
    return (
        <h2 style={{ fontWeight: 700, marginTop: 0 }}>{t(title)}</h2>
    );
});

export default PageHeader;
