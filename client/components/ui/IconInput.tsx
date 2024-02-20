import React, { ChangeEvent, ReactElement } from "react";
import {
    Input,
    InputGroup,
    InputLeftElement,
    InputRightElement,
} from "@chakra-ui/react";

interface IconInputProps {
    type: string;
    icon: ReactElement;
    rightIcon?: ReactElement | null;
    placeholder: string;
    className?: string;
    value: string;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

const IconInput = ({
    type,
    icon,
    rightIcon,
    placeholder,
    className,
    value,
    onChange,
}: IconInputProps) => {
    return (
        <InputGroup>
            <InputLeftElement pointerEvents="none">{icon}</InputLeftElement>
            <Input
                type={type}
                placeholder={placeholder}
                className={className}
                value={value}
                onChange={onChange}
            />
            {rightIcon && <InputRightElement>{rightIcon}</InputRightElement>}
        </InputGroup>
    );
};

export default IconInput;
