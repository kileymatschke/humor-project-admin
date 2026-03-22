import { createClient } from "../../../lib/supabase/server";
import { adelia, fors, kindergarten } from "../fonts/fonts";
import Link from "next/link";
import ExpandableTable from "../components/ExpandableTable";

type PageProps = {
    searchParams?: Promise<{
        section?: string;
        page?: string;
    }>;
};

export default async function HumorFlavorStepsPage({ searchParams }: PageProps) {
    const supabase = await createClient();

    const params = await searchParams;
    const page = Math.max(Number(params?.page ?? "1"), 1);

    const pageSize = 100;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
        .from("humor_flavor_steps")
        .select("*", { count: "exact" }) // ✅ includes ALL columns (including your 4 new ones)
        .order("created_datetime_utc", { ascending: false }) // ✅ stable pagination
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
    const hasNextPage = to + 1 < totalRows;

    return (
        <main style={{ padding: 24, minHeight: "100vh" }}>
            <h1 className={adelia.className}>Humor Flavor Steps</h1>

            <div
                className={fors.className}
                style={{
                    marginTop: 16,
                    marginBottom: 16,
                    fontSize: 16,
                }}
            >
                Showing page {page} ({rows.length} rows loaded)
            </div>

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
                                section: "humor-flavor-steps",
                                page: String(page - 1),
                            },
                        }}
                        className={fors.className}
                        style={navButtonStyle}
                    >
                        ← Previous
                    </Link>
                )}

                {hasNextPage && (
                    <Link
                        href={{
                            pathname: "/",
                            query: {
                                section: "humor-flavor-steps",
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