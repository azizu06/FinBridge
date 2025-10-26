export default function TransactionTable({ table }) {
    if (!table?.columns || !table?.rows) {
        return null;
    }

    return (
        <div className="my-3 overflow-x-auto rounded-2xl border border-neutral-200 bg-white px-4 py-3 shadow-sm">
            <h3 className="text-sm font-medium text-neutral-500">
                Recent transactions
            </h3>
            <table className="mt-3 min-w-full text-sm">
                <thead>
                    <tr className="text-left text-neutral-500">
                        {table.columns.map((column) => (
                            <th key={column} className="pb-2 pr-4 font-medium">
                                {column}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {table.rows.map((row, rowIndex) => (
                        <tr
                            key={rowIndex}
                            className="border-t border-neutral-200 text-neutral-800"
                        >
                            {row.map((cell, cellIndex) => (
                                <td key={cellIndex} className="py-2 pr-4">
                                    {cell}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

