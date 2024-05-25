export default function Table() {
  const columns = [
    {
      label: "Name",
      key: "name",
    },
    {
      label: "Arguments",
      key: "arguments",
    },
    {
      label: "Return type",
      key: "returnType",
    },
    {
      label: "Security",
      key: "security",
    },
  ];

  const data = [
    {
      name: "John Doe",
      arguments: 28,
      returnType: "john@example.com",
      security: "test",
    },
    {
      name: "John Doe",
      arguments: 28,
      returnType: "john@example.com",
      security: "test",
    },
    {
      name: "John Doe",
      arguments: 28,
      returnType: "john@example.com",
      security: "test",
    },
    {
      name: "John Doe",
      arguments: 28,
      returnType: "john@example.com",
      security: "test",
    },
  ];

  return (
    <div className="text-sm text-primary">
      <table className="w-full overflow-hidden border rounded border-borderColor">
        <thead className="text-left">
          <tr className="bg-secondaryHover ">
            {columns.map((column) => (
              <th key={column.key} className="px-6 py-3">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-secondary">
          {data.map((row, index) => (
            <tr key={index}>
              {columns.map((column) => (
                <td key={column.key} className="px-6 py-3">
                  {row[column.key as keyof typeof row]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
