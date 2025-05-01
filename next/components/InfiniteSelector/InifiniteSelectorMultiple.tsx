import { Dropdown, DropdownProps } from "../Dropdown/Dropdown";

type InfiniteSelectorProps = {
    className?: string;
    endClassName?: string;
} & DropdownProps;

export const InfiniteSelectorMultiple = ({
    className, endClassName,
    ...props
}: InfiniteSelectorProps) => {
    return (
        <Dropdown isMulti={true} {...props} />
    );
};
