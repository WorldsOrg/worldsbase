import { Tooltip } from "@chakra-ui/react";

interface TableNameButtonProps {
    tableName: string;
    maxWidth: number;
    onClick: () => void;
    selectedTable: any;
}

const TableNameButton = ({
    tableName,
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
        >
            <button
                onClick={onClick}
                className={classNames(
                    tableName === selectedTable
                        ? "bg-secondaryHover text-white"
                        : "dark:text-primary light:text-white hover:bg-secondaryHover hover:text-white",
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