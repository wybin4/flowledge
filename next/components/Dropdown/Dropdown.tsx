import React, { useEffect, useState } from 'react';
import Select, { ActionMeta, DropdownIndicatorProps, FormatOptionLabelMeta, GroupBase, OptionsOrGroups, StylesConfig } from 'react-select';
import SelectorInfiniteIcon from "../../assets/selector-infinite.svg";
import { useTranslation } from 'react-i18next';

const fontSize = '.95rem';

const textStyle = {
    caretColor: 'var(--light)',
    fontSize,
    color: 'var(--light)',
    marginLeft: '-.1rem'
};

const containerStyle = (isFocused: boolean) => ({
    border: `solid .125rem ${isFocused ? 'var(--light)' : 'var(--input-border)'} !important`,
    borderRadius: '.875rem',
    backgroundColor: 'var(--button)',
});

const customStyles: StylesConfig<unknown, boolean, GroupBase<unknown>> = {
    control: (base, { isFocused }) => ({
        ...base, ...containerStyle(isFocused),
        display: 'flex',
        alignItems: 'center',

        padding: '.4rem .6rem',

        outline: 'none',
        boxShadow: 'none',

        cursor: 'pointer'
    }),
    input: (base) => ({ ...base, ...textStyle }),
    singleValue: (base) => ({ ...base, ...textStyle }),
    menu: (base) => ({ ...base, ...containerStyle(false) }),
    indicatorsContainer: () => ({
        border: 'none',
    }),
    indicatorSeparator: () => ({
        display: 'none',
    }),
};

const DropdownIndicator = (props: DropdownIndicatorProps) => {
    return (
        <div {...props.innerProps} style={{
            paddingRight: '.3rem',
            paddingTop: '4px',
            color: 'var(--input-border)'
        }}>
            <SelectorInfiniteIcon />
        </div>
    );
};

export type DropdownProps = {
    value?: string;
    searchQuery?: string;
    setSearchQuery?: (query: string) => void;
    changeable?: boolean;
    options?: OptionsOrGroups<unknown, GroupBase<unknown>>;
    onChange?: ((newValue: unknown, actionMeta: ActionMeta<unknown>) => void);
    placeholder?: string;
    noOptionsPlaceholder?: string;
    width?: number;
    optionWidth?: number;
    formatOptionLabel?: ((data: unknown, formatOptionLabelMeta: FormatOptionLabelMeta<unknown>) => React.ReactNode);
};

export const Dropdown = ({
    value, changeable = true, options, onChange,
    searchQuery, setSearchQuery,
    placeholder, noOptionsPlaceholder, formatOptionLabel,
    width = 25, optionWidth = 94.6,
}: DropdownProps) => {
    const { t } = useTranslation();

    const [selectedValue, setSelectedValue] = useState<any | null>(null);

    const handleInputChange = (newValue: string) => {
        setSearchQuery?.(newValue);
        return newValue;
    };

    useEffect(() => {
        const newInitialValue = options?.find((option: any) => option.value === value);
        setSelectedValue(changeable ? newInitialValue : null);
    }, [JSON.stringify(value), JSON.stringify(options)]);

    const handleChange = (newValue: unknown, actionMeta: ActionMeta<unknown>) => {
        setSelectedValue(changeable ? newValue : null);
        onChange?.(newValue, actionMeta);
    };

    return (
        <div>
            <Select
                value={selectedValue}
                options={options}
                onInputChange={handleInputChange}
                inputValue={searchQuery}
                onChange={handleChange}
                placeholder={placeholder ?? ''}
                noOptionsMessage={() => noOptionsPlaceholder ?? t('there-are-no-options')}
                formatOptionLabel={formatOptionLabel}
                filterOption={(option, searchText) => {
                    return option.label.toLowerCase().includes(searchText.toLowerCase());
                }}
                styles={{
                    ...customStyles,
                    container: (base) => ({
                        ...base,
                        width: `${width}rem`
                    }),
                    option: (base, { isFocused }) => ({
                        ...base,
                        width: `${optionWidth}%`,

                        fontSize,

                        backgroundColor: isFocused ? 'var(--button-hover)' : 'var(--button)',
                        '&:active': {
                            backgroundColor: 'var(--button-transparent)',
                        },
                        borderRadius: '.66rem',

                        margin: '0.5rem 0.62rem',
                        padding: '0.7rem',

                        cursor: 'pointer',
                    })
                }}
                components={{ DropdownIndicator }}
            />
        </div>
    );
};