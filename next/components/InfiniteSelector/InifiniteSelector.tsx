import { Dropdown, DropdownProps } from "../Dropdown/Dropdown";

type InfiniteSelectorProps = {
    className?: string;
    endClassName?: string;
} & DropdownProps;

export const InfiniteSelector = ({
    className, endClassName,
    ...props
}: InfiniteSelectorProps) => {
    return (
        <Dropdown {...props} />
    );
};
