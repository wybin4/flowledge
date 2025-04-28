import { InputBox } from "../InputBox/InputBox";
import SelectorInfiniteIcon from "../../assets/selector-infinite.svg";

type InfiniteSelectorProps = {
    placeholder?: string;
    value: string;
    className?: string;
    endClassName?: string;
};

export const InfiniteSelector = ({
    value, placeholder = '',
    className, endClassName
}: InfiniteSelectorProps) => {
    return (
        <InputBox
            className={className}
            endClassName={endClassName}
            name={placeholder}
            icon={<SelectorInfiniteIcon />}
        >
            <div>{value}</div>
        </InputBox>
    );
};