import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export type ColumnDefinition<T> = {
  key: keyof T | string;
  label: string | React.ReactNode;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

type TableWrapperProps<T> = {
  data: T[];
  columns: ColumnDefinition<T>[];
  renderActions?: (row: T) => React.ReactNode;
  tableClassName?: string;
  rowClassName?: string;
}

function getNestedValue<T>(obj: T, path: string): unknown {
  return path.split(".").reduce((acc: unknown, part: string) => {
    if (typeof acc === "object" && acc !== null && part in acc) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, obj);
}

export function TableWrapper<T>({
  data,
  columns,
  renderActions,
  tableClassName = "",
  rowClassName = "",
}: TableWrapperProps<T>) {
  return (
    <div className="w-full overflow-x-auto">
      <Table className={tableClassName}>
        <TableHeader>
          <TableRow className="border-zinc-400">
            {columns.map((col, i) => (
              <TableHead key={i} className={`text-zinc-300 ${col.className || ""}`}>
                {col.label}
              </TableHead>
            ))}
            {renderActions && (
              <TableHead className="text-right text-zinc-300">Actions</TableHead>
            )}
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow
              key={rowIndex}
              className={`hover:bg-zinc-800 group border-zinc-800 ${rowClassName}`}
            >
              {columns.map((col, colIndex) => {
                const key = col.key as string;

                const value = key.includes(".")
                  ? getNestedValue(row, key)
                  : (row as Record<string, unknown>)[key];

                return (
                  <TableCell key={colIndex} className={col.className}>
                    {col.render ? col.render(row) : String(value)}
                  </TableCell>
                );
              })}

              {renderActions && (
                <TableCell className="text-right">
                  {renderActions(row)}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
