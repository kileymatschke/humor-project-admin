import { createClient } from "../../../lib/supabase/server";
import { adelia, kindergarten, fors } from "../fonts/fonts";
import Link from "next/link";

export default async function HumorFlavorsPage() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("humor_flavors")
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

    // automatically get column names
    const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

    return (
        <main style={{ padding: 24, minHeight: "100vh" }}>
            <h1 className={adelia.className}>Humor Flavors</h1>


            {/*<div*/}
            {/*    className={kindergarten.className}*/}
            {/*    style={{ marginTop: 6, fontSize: 16, fontWeight: 700 }}*/}
            {/*>*/}
            {/*    <Link href="/" style={{ textDecoration: "none", color: "black" }}>*/}
            {/*        ← Back to dashboard*/}
            {/*    </Link>*/}
            {/*</div>*/}

            {/*<div*/}
            {/*    className={fors.className}*/}
            {/*    style={{*/}
            {/*        fontSize: "20px",*/}
            {/*        fontWeight: "bold",*/}
            {/*        marginTop: 16,*/}
            {/*        marginBottom: 16,*/}
            {/*    }}*/}
            {/*>*/}
            {/*    Total Rows: {rows.length}*/}
            {/*</div>*/}

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
                                    }}
                                >
                                    {String(row[col] ?? "—")}
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
