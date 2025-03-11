import { IMarkdownEditor, ToolBarProps } from "@uiw/react-markdown-editor";
import { useEffect } from "react";

export const Preview: React.FC<{ editorProps: IMarkdownEditor & ToolBarProps }> = ({ editorProps }) => {
    const { containerEditor, preview, previewWidth = '50%' } = editorProps;

    useEffect(() => {
        if (preview.current && containerEditor.current) {
            const $preview = preview.current;
            const $editor = containerEditor.current;

            $preview.style.width = previewWidth;
            $preview.style.overflow = 'auto';
            $preview.style.borderLeft = '1px solid var(--color-border-muted)';
            $preview.style.padding = '20px';

            $editor.style.width = `calc(100% - ${previewWidth})`;
        }
    }, [containerEditor, preview, previewWidth]);

    return null; // Компонент рендерится только для управления стилями
};