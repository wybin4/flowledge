import { memo } from "react";
import { SettingWrapperProps } from "../settingWrapper/SettingWrapper";
import { javascript } from "@codemirror/lang-javascript";
import CodeMirror from "@uiw/react-codemirror";
import { foldGutter } from "@codemirror/language";
import { useDebouncedSave } from "@/hooks/useDebouncedSave";
import { SettingValueType } from "@/types/Setting";
import "./SettingCode.css";
import FocusableContainer from "@/components/FocusableContainer";
import "../../../components/Editor/CodeEditorCommon.css";
import cn from "classnames";

export const SettingCode = memo(({ setting, handleSave }: SettingWrapperProps) => {
    const [inputValue, setInputValue] = useDebouncedSave<SettingValueType>(
        setting.value,
        1000,
        (value) => handleSave({ id: setting._id, value })
    );

    return (
        <FocusableContainer>
            {(focused) => (
                <CodeMirror
                    className={cn(focused ? 'code-mirror-focused' : 'code-mirror', 'setting-code')}
                    value={inputValue as string}
                    onChange={(value) => setInputValue(value)}
                    height="200px"
                    extensions={[
                        javascript(),
                        foldGutter({
                            openText: "▾",
                            closedText: "▸",
                        }),
                    ]}
                    theme="none"
                    basicSetup={{
                        foldGutter: false,
                        autocompletion: false,
                        highlightActiveLine: false,
                        highlightActiveLineGutter: false
                    }}
                />
            )}
        </FocusableContainer>
    );
});