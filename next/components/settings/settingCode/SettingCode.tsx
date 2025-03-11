import { memo, useRef, useState } from "react";
import { SettingWrapperProps } from "../settingWrapper/SettingWrapper";
import { javascript } from "@codemirror/lang-javascript";
import CodeMirror from "@uiw/react-codemirror";
import { foldGutter } from "@codemirror/language";

export const SettingCode = memo(({ setting }: SettingWrapperProps) => {
    const [focused, setFocused] = useState(false);
    const divRef = useRef(null);

    return (
        <div
            ref={divRef}
            tabIndex={-1}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
        >
            <CodeMirror
                className={focused ? 'code-mirror-focused' : ''}
                value={setting.value as string}
                height="200px"
                extensions={[
                    javascript(),
                    foldGutter({
                        openText: "▾",
                        closedText: "▸",
                    }),
                ]}
                theme="none"
                basicSetup={{ foldGutter: false, autocompletion: false }}
            />
        </div>
    );
});