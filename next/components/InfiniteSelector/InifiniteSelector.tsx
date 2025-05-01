import { useState, useEffect } from "react";
import { ActionMeta } from "react-select";
import { Dropdown, DropdownProps } from "../Dropdown/Dropdown";

type InfiniteSelectorProps = {
    changeable?: boolean;
    className?: string;
    endClassName?: string;
} & DropdownProps;

export const InfiniteSelector = ({
    value, changeable = true, options, onChange,
    className, endClassName,
    ...props
}: InfiniteSelectorProps) => {
    const [selectedValue, setSelectedValue] = useState<any | null>(null);

    useEffect(() => {
        const newInitialValue = options?.find((option: any) => option.value === value);
        setSelectedValue(changeable ? newInitialValue : null);
    }, [JSON.stringify(value), JSON.stringify(options)]);

    const handleChange = (newValue: unknown, actionMeta: ActionMeta<unknown>) => {
        setSelectedValue(changeable ? newValue : null);
        onChange?.(newValue, actionMeta);
    };

    return (
        <Dropdown
            value={selectedValue}
            onChange={handleChange}
            options={options}
            {...props}
        />
    );
};
