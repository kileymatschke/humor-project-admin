import { createClient } from "../../../lib/supabase/server";
import { adelia, kindergarten, fors } from "../fonts/fonts";
import Link from "next/link";

type PageProps = {
    searchParams?: Promise<{
        page?: string;
    }>;
};

export default async function CaptionRequestsPage({ searchParams }: PageProps) {
    const supabase = await createClient();

    const params = await searchParams;
    const page = Math.max(Number(params?.page ?? "1"), 1);

    const pageSize = 1000;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
        .from("caption_requests")
        .select("*", { count: "exact" })
        .range(from, to);

    if (error) {
        return (
            <main style={{ padding: 24 }}>
                <h1>Error</h1>
                <pre>{JSON.stringify(error, null, 2)}</pre>
            </main>
        );
    }

    const rows = data ?? [];
    const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
    const totalRows = count ?? 0;
    const totalPages = Math.max(Math.ceil(totalRows / pageSize), 1);

    return (
        <main style={{ padding: 24, minHeight: "100vh" }}>
            <h1 className={adelia.className}>Caption Requests</h1>

            {/*<div*/}
            {/*    className={kindergarten.className}*/}
            {/*    style={{ marginTop: 6, fontSize: 16, fontWeight: 700 }}*/}
            {/*>*/}
            {/*    <Link href="/" style={{ textDecoration: "none", color: "black" }}>*/}
            {/*        ← Back to dashboard*/}
            {/*    </Link>*/}
            {/*</div>*/}

            {/*<div*/}
            {/*    className={kindergarten.className}*/}
            {/*    style={{*/}
            {/*        fontSize: "20px",*/}
            {/*        fontWeight: "bold",*/}
            {/*        marginTop: 16,*/}
            {/*        marginBottom: 8,*/}
            {/*    }}*/}
            {/*>*/}
            {/*    Total Rows: {totalRows}*/}
            {/*</div>*/}

            <div
                className={fors.className}
                style={{ marginBottom: 16, fontSize: 16 }}
            >
                Showing page {page} (100 rows loaded)
            </div>

            <div
                style={{
                    display: "flex",
                    gap: 12,
                    marginBottom: 20,
                    flexWrap: "wrap",
                }}
            >
                {page > 1 && (
                    <Link
                        href={`?page=${page - 1}`}
                        className={fors.className}
                        style={{
                            textDecoration: "none",
                            color: "black",
                            border: "1px solid #ccc",
                            padding: "8px 14px",
                            borderRadius: "10px",
                            backgroundColor: "#f5f5f5",
                        }}
                    >
                        ← Previous
                    </Link>
                )}

                {page < totalPages && (
                    <Link
                        href={`?page=${page + 1}`}
                        className={fors.className}
                        style={{
                            textDecoration: "none",
                            color: "black",
                            border: "1px solid #ccc",
                            padding: "8px 14px",
                            borderRadius: "10px",
                            backgroundColor: "#f5f5f5",
                        }}
                    >
                        Next →
                    </Link>
                )}
            </div>

            <div style={{ overflowX: "auto" }}>
                <table
                    style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        backgroundColor: "white",
                        border: "1px solid #ccc",
                        tableLayout: "fixed",
                    }}
                >
                    <thead>
                    <tr style={{ backgroundColor: "#f5f5f5" }}>
                        {columns.map((col) => (
                            <th
                                key={col}
                                className={fors.className}
                                style={{
                                    textAlign: "left",
                                    padding: "12px",
                                    borderBottom: "1px solid #ccc",
                                }}
                            >
                                {col}
                            </th>
                        ))}
                    </tr>
                    </thead>

                    <tbody>
                    {rows.map((row, i) => (
                        <tr key={i}>
                            {columns.map((col) => (
                                <td
                                    key={col}
                                    className={fors.className}
                                    style={{
                                        padding: "12px",
                                        borderBottom: "1px solid #eee",
                                        verticalAlign: "top",
                                    }}
                                >
                                    <div
                                        style={{
                                            maxHeight: "80px",
                                            maxWidth: "220px",
                                            overflow: "auto",
                                            whiteSpace: "pre-wrap",
                                            wordBreak: "break-word",
                                        }}
                                    >
                                        {row[col] === null || row[col] === undefined
                                            ? "—"
                                            : typeof row[col] === "object"
                                                ? JSON.stringify(row[col], null, 2)
                                                : String(row[col])}
                                    </div>
                                </td>
                            ))}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </main>
    );
}
