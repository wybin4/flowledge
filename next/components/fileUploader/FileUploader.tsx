import React, { ReactNode, useEffect, useRef, useState } from "react";
import styles from "./FileUploader.module.css";
import { useTranslation } from "react-i18next";

type FileUploaderProps = {
    allowedTypes: string;
    onFileUpload: (file: File) => void;
    input: (onClick: () => void) => ReactNode;
};

const FileUploader: React.FC<FileUploaderProps> = ({ input, allowedTypes, onFileUpload }) => {
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { t } = useTranslation();

    useEffect(() => {
        setError(null);
    }, [allowedTypes]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const fileExtension = file.name.split(".").pop()?.toLowerCase();
        const validExtensions = allowedTypes.split(",").map(type => `.${type.trim().toLowerCase()}`);

        if (!fileExtension || !validExtensions.includes(`.${fileExtension}`)) {
            setError(`${t('file-must-be-one-of-types')} ${allowedTypes}`);
            return;
        }

        setError(null);
        onFileUpload(file);
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className={styles.fileUploader}>
            <input
                ref={fileInputRef}
                type='file'
                accept={allowedTypes.split(",").map(type => `.${type.trim()}`).join(", ")}
                onChange={handleFileChange}
                className={styles.hiddenInput}
            />
            {input(handleClick)}
            {error && <div className={styles.error}>{error}</div>}
        </div>
    );
};

export default FileUploader;
