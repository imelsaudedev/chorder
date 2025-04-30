import React from "react";

type ColumnsIconProps = {
  count: number;
};

export default function ColumnsIcon({ count }: ColumnsIconProps) {
  const cols = Array.from(Array(count).keys());
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      {cols.map((i) => {
        const space = 3;
        const width = Math.floor((12 - (count - 1) * space) / count);
        const start = 6 + i * (width + space);
        const end = start + width;
        return (
          <path
            key={`col__${i}`}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={`M${start} 6L${end} 6M${start} 10L${end} 10M${start} 14L${end} 14M${start} 18L${end} 18`}
          />
        );
      })}
    </svg>
  );
}
