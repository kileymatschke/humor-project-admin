"use client";

import { kindergarten, fors } from "../fonts/fonts";
import { useEffect, useRef, useState } from "react";

type ExpandableTableProps = {
    rows: Record<string, unknown>[];
    columns: string[];
};

export default function ExpandableTable({
                                            rows,
                                            columns,
                                        }: ExpandableTableProps) {
    const [expandedCells, setExpandedCells] = useState<Record<string, boolean>>(
        {}
    );
    const [tableWidth, setTableWidth] = useState(1600);

    const topScrollRef = useRef<HTMLDivElement>(null);
    const bottomScrollRef = useRef<HTMLDivElement>(null);
    const tableRef = useRef<HTMLTableElement>(null);
    const isSyncingRef = useRef(false);

    const toggleCell = (rowIndex: number, colName: string) => {
        const key = `${rowIndex}-${colName}`;
        setExpandedCells((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const formatValue = (value: unknown) => {
        if (value === null || value === undefined) return "—";
        if (typeof value === "object") return JSON.stringify(value, null, 2);
        return String(value);
    };

    useEffect(() => {
        const updateTableWidth = () => {
            if (tableRef.current) {
                setTableWidth(tableRef.current.scrollWidth);
            }
        };

        updateTableWidth();

        const resizeObserver = new ResizeObserver(() => {
            updateTableWidth();
        });

        if (tableRef.current) {
            resizeObserver.observe(tableRef.current);
        }

        window.addEventListener("resize", updateTableWidth);

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener("resize", updateTableWidth);
        };
    }, [rows, columns, expandedCells]);

    const syncTopScroll = () => {
        if (!topScrollRef.current || !bottomScrollRef.current) return;
        if (isSyncingRef.current) return;

        isSyncingRef.current = true;
        bottomScrollRef.current.scrollLeft = topScrollRef.current.scrollLeft;
        requestAnimationFrame(() => {
            isSyncingRef.current = false;
        });
    };

    const syncBottomScroll = () => {
        if (!topScrollRef.current || !bottomScrollRef.current) return;
        if (isSyncingRef.current) return;

        isSyncingRef.current = true;
        topScrollRef.current.scrollLeft = bottomScrollRef.current.scrollLeft;
        requestAnimationFrame(() => {
            isSyncingRef.current = false;
        });
    };

    return (
        <>
            <div
                ref={topScrollRef}
                onScroll={syncTopScroll}
                style={{
                    overflowX: "auto",
                    overflowY: "hidden",
                    marginBottom: "8px",
                }}
            >
                <div style={{ width: `${tableWidth}px`, height: "1px" }} />
            </div>

            <div
                ref={bottomScrollRef}
                onScroll={syncBottomScroll}
                style={{ overflowX: "auto" }}
            >
                <table
                    ref={tableRef}
                    style={{
                        borderCollapse: "collapse",
                        backgroundColor: "white",
                        border: "1px solid #ccc",
                        minWidth: "1600px",
                    }}
                >
                    <thead>
                    <tr style={{ backgroundColor: "#F7F9ED" }}>
                        {columns.map((col) => (
                            <th
                                key={col}
                                className={fors.className}
                                style={{
                                    textAlign: "left",
                                    padding: "12px",
                                    borderBottom: "1px solid #ccc",
                                    whiteSpace: "nowrap",
                                    minWidth: "220px",
                                }}
                            >
                                {col}
                            </th>
                        ))}
                    </tr>
                    </thead>

                    <tbody>
                    {rows.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            {columns.map((col) => {
                                const key = `${rowIndex}-${col}`;
                                const expanded = !!expandedCells[key];
                                const value = formatValue(row[col]);

                                return (
                                    <td
                                        key={col}
                                        className={fors.className}
                                        onDoubleClick={() =>
                                            toggleCell(rowIndex, col)
                                        }
                                        title="Double-click to expand or collapse"
                                        style={{
                                            padding: "12px",
                                            borderBottom: "1px solid #eee",
                                            verticalAlign: "top",
                                            minWidth: "220px",
                                            maxWidth: expanded ? "500px" : "220px",
                                            cursor: "pointer",
                                            userSelect: "text",
                                        }}
                                    >
                                        <div
                                            style={{
                                                whiteSpace: expanded
                                                    ? "pre-wrap"
                                                    : "nowrap",
                                                overflow: "hidden",
                                                textOverflow: expanded
                                                    ? "clip"
                                                    : "ellipsis",
                                                maxWidth: expanded
                                                    ? "500px"
                                                    : "220px",
                                            }}
                                        >
                                            {value}
                                        </div>
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}
