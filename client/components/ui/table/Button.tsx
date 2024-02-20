import { ReactElement } from "react";

interface ButtonProps {
    className?: string;
    onClick: () => void;
    icon?: ReactElement;
    text: string;
}

const Button = ({ className, onClick, icon, text }: ButtonProps) => {
    return (
        <button
            className={`${className} flex items-center gap-2 px-3 py-2 text-sm border border-borderColor text-primary bg-background hover:bg-hoverBg`}
            onClick={onClick}
        >
            <div>{icon}</div>
            {text}
        </button>
    );
};

export default Button;
