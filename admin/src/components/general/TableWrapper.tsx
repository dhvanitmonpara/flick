import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils";

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
    <div className="w-full overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-800/20">
      <Table className={cn("min-w-full", tableClassName)}>
        <TableHeader>
          <TableRow className="border-zinc-800 bg-zinc-900/90 hover:bg-zinc-800/80">
            {columns.map((col, i) => (
              <TableHead
                key={i}
                className={cn(
                  "h-11 px-4 text-xs font-semibold uppercase tracking-wide text-zinc-400",
                  col.className
                )}
              >
                {col.label}
              </TableHead>
            ))}
            {renderActions && (
              <TableHead className="h-11 px-4 text-right text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Actions
              </TableHead>
            )}
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow
              key={rowIndex}
              className={cn(
                "group border-zinc-800/90 hover:bg-zinc-800/60 data-[state=selected]:bg-zinc-800/70",
                rowClassName
              )}
            >
              {columns.map((col, colIndex) => {
                const key = col.key as string;

                const value = key.includes(".")
                  ? getNestedValue(row, key)
                  : (row as Record<string, unknown>)[key];

                return (
                  <TableCell key={colIndex} className={cn("px-4 py-3 text-zinc-200", col.className)}>
                    {col.render ? col.render(row) : String(value)}
                  </TableCell>
                );
              })}

              {renderActions && (
                <TableCell className="w-[120px] px-4 py-3 text-right">
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
