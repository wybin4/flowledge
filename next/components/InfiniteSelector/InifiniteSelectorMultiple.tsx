import { useEffect, useState } from "react";
import { Dropdown, DropdownProps } from "../Dropdown/Dropdown";
import { ActionMeta, components } from "react-select";
import React from "react";
import { useIcon } from "@/hooks/useIcon";
import styles from "./InifiniteSelector.module.css";
import { handlePluralTranslation } from "@/helpers/handlePluralTranslation";
import { useTranslation } from "react-i18next";
import { useUserSetting } from "@/user/hooks/useUserSetting";
import { Language } from "@/user/types/Language";

type InfiniteSelectorProps = {
    prefix: string;
    selectedKey: string;
    className?: string;
    endClassName?: string;
} & DropdownProps;

export const InfiniteSelectorMultiple = ({
    prefix, selectedKey,
    value, options, onChange,
    className, endClassName,
    ...props
}: InfiniteSelectorProps) => {
    const [selectedValues, setSelectedValues] = useState<any[]>([]);

    const checkedIcon = useIcon('check');
    const { t } = useTranslation();
    const locale = useUserSetting<Language>('language') || Language.EN;

    useEffect(() => {
        if (!selectedValues.length && value && Array.isArray(value)) {
            const newInitialValues = options?.filter((option: any) =>
                value.includes(option.value) &&
                !selectedValues.some((val: any) => val.value === option.value)
            );
            setSelectedValues(newInitialValues || []);
        }
    }, [JSON.stringify(options)]);

    const handleChange = (newValue: any, actionMeta: ActionMeta<unknown>) => {
        setSelectedValues((vals) => {
            const isAlreadySelected = vals.some((val) => val.value === newValue.value);
            if (isAlreadySelected) {
                onChange?.({ ...newValue, action: 'remove' }, actionMeta);
                return vals.filter((val) => val.value !== newValue.value);
            } else {
                onChange?.(newValue, actionMeta);
                return [...vals, newValue];
            }
        });
    };

    return (
        <Dropdown
            value={''}
            onChange={handleChange}
            options={options}
            width={'13rem'}
            optionChild={
                (props: any) => {
                    const { value, label } = props;
                    const isAlreadySelected = selectedValues.some((val) => val.value === value);
                    return (
                        <components.Option {...props}>
                            <div className={styles.multiOption}>
                                {isAlreadySelected &&
                                    <div className={styles.multiOptionIcon}>
                                        {checkedIcon}
                                    </div>
                                }
                                <div className={styles.multiOptionText}>{label}</div>
                            </div>
                        </components.Option>
                    );
                }
            }
            valueChild={
                ({ children, ...props }: any) => {
                    const inputValue = props.selectProps.inputValue;

                    return (
                        <components.ValueContainer {...props}>
                            <div className={styles.multiValueContainer}>
                                {React.Children.map(children, (child) =>
                                    child
                                )}
                                {!inputValue && (
                                    <div className={styles.multiValuePlaceholder}>
                                        {handlePluralTranslation(prefix, t, selectedValues.length, selectedKey, locale)}
                                    </div>
                                )}
                            </div>
                        </components.ValueContainer>
                    );
                }}
            {...props}
        />
    );
};
