import { Tooltip } from "@chakra-ui/react";

interface TableNameButtonProps {
    tableName: string;
    textLength: number;
    maxWidth: number;
    onClick: () => void;
    selectedTable: any;
}

const TableNameButton = ({
    tableName,
    textLength,
    maxWidth,
    onClick,
    selectedTable,
}: TableNameButtonProps) => {
    function classNames(...classes: string[]) {
        return classes.filter(Boolean).join(" ");
    }

    return (
        <Tooltip
            label={tableName}
            className="bg-background text-primary"
            isDisabled={tableName.length < textLength}
        >
            <button
                onClick={onClick}
                className={classNames(
                    tableName === selectedTable
                        ? "bg-hoverBg text-secondary "
                        : "text-primary hover:text-secondary  hover:bg-hoverBg",
                    "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                )}
            >
                <span
                    className={`whitespace-nowrap text-ellipsis overflow-hidden max-w-[${maxWidth}px]`}
                >
                    {tableName}
                </span>
            </button>
        </Tooltip>
    );
};

export default TableNameButton;