import { Dropdown, DropdownProps } from "../Dropdown/Dropdown";

type InfiniteSelectorProps = {
    className?: string;
    endClassName?: string;
} & DropdownProps;

export const InfiniteSelector = ({
    options,
    className, endClassName,
    ...props
}: InfiniteSelectorProps) => {
    return (
        <Dropdown options={options} {...props} />
    );
};
