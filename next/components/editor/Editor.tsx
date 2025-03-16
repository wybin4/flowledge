"use client"
const MarkdownEditor = dynamic(
    () => import("@uiw/react-markdown-editor").then((mod) => mod.default),
    { ssr: false }
);
import React, { Dispatch, JSX, SetStateAction, useEffect, useState } from 'react';
import dynamic from "next/dynamic";
import { ICommand } from "@uiw/react-markdown-editor";
import { Preview } from '../Preview';
import { remark } from 'remark';
import strip from 'strip-markdown';
import "./Editor.css";
import { IconKey, useIcon } from '@/hooks/useIcon';
import FocusableContainer from '../FocusableContainer';
import "./CodeEditorCommon.css";
import cn from "classnames";

type EditorProps = {
    markdownText: string;
    setMarkdownText: Dispatch<SetStateAction<string>>;
    className: string;
};

const loadingIcon = (
    <svg className='loader' xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 512 512">
        <path fill="var(--color-fg-default)" d="M304 48a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zm0 416a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zM48 304a48 48 0 1 0 0-96 48 48 0 1 0 0 96zm464-48a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zM142.9 437A48 48 0 1 0 75 369.1 48 48 0 1 0 142.9 437zm0-294.2A48 48 0 1 0 75 75a48 48 0 1 0 67.9 67.9zM369.1 437A48 48 0 1 0 437 369.1 48 48 0 1 0 369.1 437z" />
    </svg>
);
const improveIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 512 512">
        <path fill="currentColor" d="M320 0c17.7 0 32 14.3 32 32l0 208c0 8.8 7.2 16 16 16s16-7.2 16-16l0-176c0-17.7 14.3-32 32-32s32 14.3 32 32l0 176c0 8.8 7.2 16 16 16s16-7.2 16-16l0-112c0-17.7 14.3-32 32-32s32 14.3 32 32l0 195.1c-11.9 4.8-21.3 14.9-25 27.8l-8.9 31.2L478.9 391C460.6 396.3 448 413 448 432c0 18.9 12.5 35.6 30.6 40.9C448.4 497.4 409.9 512 368 512l-19.2 0c-59.6 0-116.9-22.9-160-64L76.4 341c-16-15.2-16.6-40.6-1.4-56.6s40.6-16.6 56.6-1.4l60.5 57.6c0-1.5-.1-3.1-.1-4.6l0-272c0-17.7 14.3-32 32-32s32 14.3 32 32l0 176c0 8.8 7.2 16 16 16s16-7.2 16-16l0-208c0-17.7 14.3-32 32-32zm-7.3 326.6c-1.1-3.9-4.7-6.6-8.7-6.6s-7.6 2.7-8.7 6.6L288 352l-25.4 7.3c-3.9 1.1-6.6 4.7-6.6 8.7s2.7 7.6 6.6 8.7L288 384l7.3 25.4c1.1 3.9 4.7 6.6 8.7 6.6s7.6-2.7 8.7-6.6L320 384l25.4-7.3c3.9-1.1 6.6-4.7 6.6-8.7s-2.7-7.6-6.6-8.7L320 352l-7.3-25.4zM104 120l48.3 13.8c4.6 1.3 7.7 5.5 7.7 10.2s-3.1 8.9-7.7 10.2L104 168 90.2 216.3c-1.3 4.6-5.5 7.7-10.2 7.7s-8.9-3.1-10.2-7.7L56 168 7.7 154.2C3.1 152.9 0 148.7 0 144s3.1-8.9 7.7-10.2L56 120 69.8 71.7C71.1 67.1 75.3 64 80 64s8.9 3.1 10.2 7.7L104 120zM584 408l48.3 13.8c4.6 1.3 7.7 5.5 7.7 10.2s-3.1 8.9-7.7 10.2L584 456l-13.8 48.3c-1.3 4.6-5.5 7.7-10.2 7.7s-8.9-3.1-10.2-7.7L536 456l-48.3-13.8c-4.6-1.3-7.7-5.5-7.7-10.2s3.1-8.9 7.7-10.2L536 408l13.8-48.3c1.3-4.6 5.5-7.7 10.2-7.7s8.9 3.1 10.2 7.7L584 408z" />
    </svg>
);

const markdownToText = async (markdown: string) => {
    const result = await remark().use(strip).process(markdown);
    return result.toString();
};

export const Editor = ({ markdownText, setMarkdownText, className }: EditorProps) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [commands, setCommands] = useState<any>([]);

    const toolbarKeys: IconKey[] = [
        'bold', 'header', 'italic', 'underline', 'image', 'code', 'link', 'ulist', 'olist', 'quote',
    ];

    const commandConfig = toolbarKeys.reduce((acc, key) => {
        acc[key] = useIcon(key);
        return acc;
    }, {} as Record<string, JSX.Element>);

    useEffect(() => {
        const loadCommands = async () => {
            const { defaultCommands } = await import('@uiw/react-markdown-editor');

            const updatedCommands = toolbarKeys.map((key) => ({
                ...defaultCommands[key as keyof typeof defaultCommands],
                icon: commandConfig[key],
            }));

            setCommands(updatedCommands);
        };

        loadCommands();
    }, []);

    const improveText: ICommand = {
        name: 'improveText',
        keyCommand: 'improveText',
        button: { 'aria-label': 'Add title text', disabled: isLoading, className: isLoading ? 'button-loading' : '' },
        icon: isLoading ? loadingIcon : improveIcon,
        execute: () => {
            (async () => {
                if (!isLoading) {
                    try {
                        setIsLoading(true);
                        const response = await fetch('http://127.0.0.1:8000/improve/', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ text: await markdownToText(markdownText) }) // Передаем текущий текст
                        });

                        const data = await response.json();
                        setIsLoading(false);
                        if (response.ok) {
                            setMarkdownText(data.text); // Обновляем текст в редакторе
                        } else {
                            console.error('Ошибка при обработке текста:', data);
                        }
                    } catch (error) {
                        console.error('Ошибка запроса:', error);
                    }
                }
            })();
        },
    };

    const settings: ICommand = {
        name: 'settings',
        keyCommand: 'settings',
        button: { 'aria-label': 'Add title text' },
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 512 512"><path fill="currentColor" d="M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6c-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2c-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9 16.3-18.2 17.8c-13.8 2.3-28 3.5-42.5 3.5s-28.7-1.2-42.5-3.5c-9.2-1.5-16.2-8.7-18.2-17.8l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4L83.1 425.9c-8.8 2.8-18.6 .3-24.5-6.8c-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3c-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4C64.6 273.1 64 264.6 64 256s.6-17.1 1.7-25.4L22.4 191.2c-6.9-6.2-9.6-15.9-6.4-24.6c4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6-11 14-21.4 22.1-31.2c5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1 9-16.3 18.2-17.8C227.3 1.2 241.5 0 256 0s28.7 1.2 42.5 3.5c9.2 1.5 16.2 8.7 18.2 17.8l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6-.3 24.5 6.8c8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1 11 11.4 22.4 15.8 34.3zM256 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160z" /></svg>
        ),
        execute: ({ state, view }) => {
            console.log('hiii')
        },
    };

    const preview: ICommand = {
        name: 'preview',
        keyCommand: 'preview',
        button: (_, props, opts) => <Preview editorProps={{ ...props, ...opts }} />,
    };

    return (
        <FocusableContainer className={className}>
            {(focused) => (
                <MarkdownEditor
                    className={cn(focused ? 'code-mirror-focused' : 'code-mirror', 'editor-code')}
                    value={markdownText}
                    height="600px"
                    onChange={(value, _) => {
                        setMarkdownText(value);
                    }}
                    toolbars={commands}
                    toolbarsMode={[improveText, settings, preview]}
                    onPreviewMode={() => false}
                    basicSetup={{
                        lineNumbers: false,
                        foldGutter: false,
                        drawSelection: false,
                        highlightActiveLine: false,
                        highlightActiveLineGutter: false
                    }}
                />)}
        </FocusableContainer>
    );
};