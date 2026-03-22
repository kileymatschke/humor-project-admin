import { createClient } from "../../../lib/supabase/server";
import { adelia, kindergarten, fors } from "../fonts/fonts";
import Link from "next/link";
import ExpandableTable from "../components/ExpandableTable";

type HumorFlavorRow = Record<string, unknown>;

export default async function HumorFlavorsPage({
                                                   searchParams,
                                               }: {
    searchParams?: Promise<{ page?: string; section?: string }>;
}) {
    const supabase = await createClient();

    const params = (await searchParams) ?? {};
    const page = Math.max(Number(params.page ?? "1"), 1);

    const pageSize = 100;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error } = await supabase
        .from("humor_flavors")
        .select("*", { count: "exact" })
        .order("created_datetime_utc", { ascending: false })
        .range(from, to);

    if (error) {
        return (
            <main style={{ padding: 24 }}>
                <h1>Error</h1>
                <pre>{JSON.stringify(error, null, 2)}</pre>
            </main>
        );
    }

    const rows: HumorFlavorRow[] = (data ?? []) as HumorFlavorRow[];
    const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

    return (
        <main style={{ padding: 24, minHeight: "100vh" }}>
            <h1 className={adelia.className}>Humor Flavors</h1>

            {/* SHOWING PAGE */}
            <div
                className={fors.className}
                style={{ marginTop: 8, marginBottom: 16, fontSize: 16 }}
            >
                Showing page {page} ({rows.length} rows loaded)
            </div>

            {/* NAV BUTTONS */}
            <div
                style={{
                    display: "flex",
                    gap: 12,
                    marginBottom: 24,
                    flexWrap: "wrap",
                }}
            >
                {page > 1 && (
                    <Link
                        href={{
                            pathname: "/",
                            query: {
                                section: "humor_flavors",
                                page: String(page - 1),
                            },
                        }}
                        className={fors.className}
                        style={navButtonStyle}
                    >
                        ← Previous
                    </Link>
                )}

                {rows.length === pageSize && (
                    <Link
                        href={{
                            pathname: "/",
                            query: {
                                section: "humor_flavors",
                                page: String(page + 1),
                            },
                        }}
                        className={fors.className}
                        style={navButtonStyle}
                    >
                        Next →
                    </Link>
                )}
            </div>

            {/* TABLE */}
            <ExpandableTable rows={rows} columns={columns} />
        </main>
    );
}

const navButtonStyle: React.CSSProperties = {
    textDecoration: "none",
    color: "black",
    border: "1px solid #ccc",
    padding: "8px 14px",
    borderRadius: "10px",
    backgroundColor: "#f5f5f5",
};