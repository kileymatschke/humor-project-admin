import { createClient } from "../../../lib/supabase/server";
import { adelia, fors } from "../fonts/fonts";
import Link from "next/link";
import ExpandableTable from "../components/ExpandableTable";

type ProfileRow = Record<string, unknown>;

export default async function UsersPage({
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

    const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*", { count: "exact" })
        .order("email", { ascending: true })
        // .order("first_name", { ascending: true })
        .range(from, to);

    if (error) {
        return (
            <main style={{ padding: 24 }}>
                <h1>Users</h1>
                <pre>{JSON.stringify(error, null, 2)}</pre>
            </main>
        );
    }

    const rows: ProfileRow[] = (profiles ?? []) as ProfileRow[];
    const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

    return (
        <main style={{ padding: 24, minHeight: "100vh", color: "#83932D" }}>
            <h1 className={adelia.className}>Users</h1>

            <div
                className={fors.className}
                style={{ marginTop: 8, marginBottom: 16, fontSize: 16 }}
            >
                Page {page} ({rows.length} rows loaded)
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
                                section: "users",
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
                                section: "users",
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
    color: "#2D7DD2",
    fontWeight: 600,
    border: "1px solid #2D7DD2",
    padding: "8px 14px",
    borderRadius: "10px",
    backgroundColor: "#EDF3FA",
};