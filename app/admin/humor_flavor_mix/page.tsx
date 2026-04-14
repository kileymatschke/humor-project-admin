import { revalidatePath } from "next/cache";
import Link from "next/link";
import { createClient } from "../../../lib/supabase/server";
import { adelia, fors, kindergarten } from "../fonts/fonts";
import ExpandableTable from "../components/ExpandableTable";
import type { CSSProperties } from "react";

type PageProps = {
    searchParams?: Promise<{
        page?: string;
    }>;
};

async function updateHumorFlavorMix(formData: FormData) {
    "use server";

    const supabase = await createClient();

    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        throw new Error("User must be logged in.");
    }

    const id = formData.get("id");
    if (!id) {
        throw new Error("Missing id");
    }

    const filteredEntries = Array.from(formData.entries()).filter(
        ([key, value]) =>
            !key.startsWith("$") &&
            key !== "id" &&
            key !== "created_by_user_id" &&
            key !== "modified_by_user_id" &&
            key !== "created_datetime_utc" &&
            key !== "modified_datetime_utc" &&
            value !== ""
    );

    const payload: Record<string, string | null> = Object.fromEntries(
        filteredEntries.map(([key, value]) => [key, String(value)])
    );

    payload.modified_by_user_id = user.id;

    const { error } = await supabase
        .from("humor_flavor_mix")
        .update(payload)
        .eq("id", id);

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath("/admin/humor_flavor_mix");
}

export default async function HumorFlavorMixPage({ searchParams }: PageProps) {
    const supabase = await createClient();

    const params = await searchParams;
    const page = Math.max(Number(params?.page ?? "1"), 1);

    const pageSize = 100;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error } = await supabase
        .from("humor_flavor_mix")
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

    const rows = data ?? [];
    const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

    const editableColumns = columns.filter(
        (col) =>
            col !== "id" &&
            col !== "created_by_user_id" &&
            col !== "modified_by_user_id" &&
            col !== "created_datetime_utc" &&
            col !== "modified_datetime_utc"
    );

    return (
        <main style={{ padding: 24, minHeight: "100vh", color: "#83932D" }}>
            <h1 className={adelia.className}>Humor Flavor Mix</h1>

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
                        href={`?page=${page - 1}`}
                        className={kindergarten.className}
                        style={navButtonStyle}
                    >
                        ← Previous
                    </Link>
                )}

                {rows.length === pageSize && (
                    <Link
                        href={`?page=${page + 1}`}
                        className={kindergarten.className}
                        style={navButtonStyle}
                    >
                        Next →
                    </Link>
                )}
            </div>

            <section style={sectionStyle}>
                <h2 className={fors.className} style={sectionTitleStyle}>
                    Update existing humor flavor mix
                </h2>

                <div
                    className={fors.className}
                    style={{ marginBottom: 12, fontSize: 14 }}
                >
                    Fill in the existing <strong>id</strong> and any fields you want to
                    update:
                </div>

                <form action={updateHumorFlavorMix} style={formGridStyle}>
                    <label style={labelStyle}>
                        <span className={fors.className}>id</span>
                        <input name="id" style={inputStyle} required />
                    </label>

                    {editableColumns.map((col) => (
                        <label key={col} style={labelStyle}>
                            <span className={fors.className}>{col}</span>
                            <input name={col} style={inputStyle} />
                        </label>
                    ))}

                    <button
                        type="submit"
                        className={fors.className}
                        style={buttonStyle}
                    >
                        Update
                    </button>
                </form>
            </section>

            <div
                className={fors.className}
                style={{
                    marginTop: 16,
                    marginBottom: 16,
                    fontSize: 16,
                }}
            >
                Page {page} ({rows.length} rows loaded)
            </div>

            <ExpandableTable rows={rows} columns={columns} />
        </main>
    );
}

const sectionStyle: CSSProperties = {
    marginBottom: 28,
    padding: 16,
    border: "1px solid #ccc",
    borderRadius: 12,
    backgroundColor: "#F7F9ED",
};

const sectionTitleStyle: CSSProperties = {
    marginTop: 0,
    marginBottom: 14,
};

const formGridStyle: CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 12,
};

const labelStyle: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: 6,
};

const inputStyle: CSSProperties = {
    padding: "10px 12px",
    border: "1px solid #ccc",
    borderRadius: 8,
};

const buttonStyle: React.CSSProperties = {
    cursor: "pointer",
    alignSelf: "end",
    width: "fit-content",
    textDecoration: "none",
    color: "#2D7DD2",
    fontWeight: 600,
    border: "1px solid #2D7DD2",
    padding: "8px 14px",
    borderRadius: "10px",
    backgroundColor: "#EDF3FA",
};

const navButtonStyle: React.CSSProperties = {
    textDecoration: "none",
    color: "#2D7DD2",
    fontWeight: 600,
    border: "1px solid #2D7DD2",
    padding: "8px 14px",
    borderRadius: "10px",
    backgroundColor: "#EDF3FA",
};