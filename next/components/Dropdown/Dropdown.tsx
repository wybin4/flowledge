import React, { ComponentType, ReactNode } from 'react';
import Select, { ActionMeta, components, DropdownIndicatorProps, FormatOptionLabelMeta, GroupBase, OptionProps, OptionsOrGroups, StylesConfig, ValueContainerProps } from 'react-select';
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
        minHeight: '3.1rem',

        display: 'flex',
        flexWrap: 'nowrap',
        alignItems: 'center',

        color: isFocused ? 'var(--light)' : 'var(--description-text)',

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
    valueContainer: (base) => ({
        ...base,
        overflow: 'inherit',
        whiteSpace: 'nowrap'
    }),
};

const DropdownIndicator = (props: DropdownIndicatorProps) => {
    return (
        <div {...props.innerProps} style={{
            display: 'flex',
            justifyContent: 'flex-end',
            flex: 1,

            paddingTop: '4px',
            color: 'var(--input-border)'
        }}>
            <div style={{
                maxWidth: 'max-content',
                marginRight: '.3rem'
            }}>
                <SelectorInfiniteIcon />
            </div>
        </div>
    );
};

export type DropdownProps = {
    value?: string;
    valueChild?: ComponentType<ValueContainerProps<unknown, boolean, GroupBase<unknown>>> | undefined;
    optionChild?: ComponentType<OptionProps<unknown, boolean, GroupBase<unknown>>> | undefined;
    searchQuery?: string;
    setSearchQuery?: (query: string) => void;
    options?: OptionsOrGroups<unknown, GroupBase<unknown>>;
    onChange?: ((newValue: unknown, actionMeta: ActionMeta<unknown>) => void);
    placeholder?: string;
    noOptionsPlaceholder?: string;
    width?: string;
    optionWidth?: string;
    formatOptionLabel?: ((data: unknown, formatOptionLabelMeta: FormatOptionLabelMeta<unknown>) => React.ReactNode);
};

export const Dropdown = ({
    value, onChange,
    options,
    optionChild, valueChild,
    searchQuery, setSearchQuery,
    placeholder, noOptionsPlaceholder, formatOptionLabel,
    width = '25rem', optionWidth = '94.6%',
}: DropdownProps) => {
    const { t } = useTranslation();

    const handleInputChange = (newValue: string) => {
        setSearchQuery?.(newValue);
        return newValue;
    };

    return (
        <Select
            value={value}
            options={options}
            onInputChange={handleInputChange}
            inputValue={searchQuery}
            onChange={onChange}
            placeholder={t(placeholder as any) ?? ''}
            noOptionsMessage={() =>
                noOptionsPlaceholder
                    ? t(noOptionsPlaceholder as any)
                    : t('there-are-no-options')
            }
            formatOptionLabel={formatOptionLabel}
            filterOption={(option, searchText) => {
                return option.label.toLowerCase().includes(searchText.toLowerCase());
            }}
            styles={{
                ...customStyles,
                container: (base) => ({
                    ...base,
                    width
                }),
                option: (base, { isFocused }) => ({
                    ...base,
                    width: `${optionWidth} !important`,

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
            components={{
                DropdownIndicator,
                Option: optionChild ? optionChild : components.Option,
                ValueContainer: valueChild ? valueChild : components.ValueContainer
            }}
        />
    );
};