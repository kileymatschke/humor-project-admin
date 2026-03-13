import { createClient } from "../../../lib/supabase/server";
import { adelia, kindergarten, fors } from "../fonts/fonts";
import Link from "next/link";

export default async function HumorFlavorStepsPage() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("humor_flavor_steps")
        .select("*");

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

    return (
        <main style={{ padding: 24, minHeight: "100vh" }}>
            <h1 className={adelia.className}>Humor Flavor Steps</h1>

            <div
                className={kindergarten.className}
                style={{ marginTop: 6, fontSize: 16, fontWeight: 700 }}
            >
                <Link href="/" style={{ textDecoration: "none", color: "black" }}>
                    ← Back to dashboard
                </Link>
            </div>

            <div
                className={kindergarten.className}
                style={{
                    fontSize: "20px",
                    fontWeight: "bold",
                    marginTop: 16,
                    marginBottom: 16,
                }}
            >
                Total Rows: {rows.length}
            </div>

            <div style={{ overflowX: "auto" }}>
                <table
                    style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        backgroundColor: "white",
                        border: "1px solid #ccc",
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
                                            maxHeight: "160px",
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
