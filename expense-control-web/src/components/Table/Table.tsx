import React from "react";

interface TableProps<T> {
  columns: string[];
  data: T[];
  renderRow: (item: T, index: number) => React.ReactNode;
}

export const Table = <T extends {}>({ columns, data, renderRow }: TableProps<T>) => {
  return (
    <table className="min-w-full border">
      <thead>
        <tr>
          {columns.map((col, idx) => (
            <th key={idx} className="border px-4 py-2 text-left">{col}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((item, idx) => renderRow(item, idx))}
      </tbody>
    </table>
  );
};