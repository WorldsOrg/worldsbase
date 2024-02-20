import { ChangeEvent } from "react";
import { Flex, FormLabel, Input, Box, Tooltip } from "@chakra-ui/react";
import { BiMinusCircle, BiPlusCircle } from "react-icons/bi";

interface Field {
  id: number;
  name: string;
  value: string;
}

interface DynamicInputsProps {
  label: string;
  fields: Field[];
  onChange: (
    fieldName: string,
    index: number,
    event: ChangeEvent<HTMLInputElement>
  ) => void;
  addField: (fieldName: string) => void;
  removeField: (fieldName: string, id: number) => void;
  fieldName: string;
}

export default function DynamicInputs({
  label,
  fields,
  onChange,
  addField,
  removeField,
  fieldName,
}: DynamicInputsProps) {
  return (
    <Flex mt={6}>
      <FormLabel mt={1} minW="80px">
        {label}
      </FormLabel>
      <Box>
        {fields.map((item, index) => (
          <Flex
            key={item.id}
            gap={3}
            mt={index !== 0 ? 3 : ""}
            display="flex"
            alignItems="center"
          >
            <Input
              mt={1}
              placeholder="Key"
              onChange={(e) => onChange(fieldName, item.id, e)}
              name="name"
              value={item.name}
            />
            <Input
              mt={1}
              placeholder="Value"
              onChange={(e) => onChange(fieldName, item.id, e)}
              name="value"
              value={item.value}
            />
            <Flex gap={2} minW={10}>
              {index === fields.length - 1 ? (
                <Tooltip label="Add Inputs" placement="top">
                  <Box
                    cursor="pointer"
                    mt={1}
                    onClick={() => addField(fieldName)}
                  >
                    <BiPlusCircle color="green" size={20} />
                  </Box>
                </Tooltip>
              ) : null}

              {item.id !== 0 && index === fields.length - 1 ? (
                <Tooltip label="Remove Inputs" placement="top">
                  <Box
                    cursor="pointer"
                    mt={1}
                    onClick={() => removeField(fieldName, item.id)}
                  >
                    <BiMinusCircle color="red" size={20} />
                  </Box>
                </Tooltip>
              ) : null}
            </Flex>
          </Flex>
        ))}
      </Box>
    </Flex>
  );
}
