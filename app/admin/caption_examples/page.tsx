import { revalidatePath } from "next/cache";
import Link from "next/link";
import { createClient } from "../../../lib/supabase/server";
import { adelia, fors } from "../fonts/fonts";
import ExpandableTable from "../components/ExpandableTable";
import type { CSSProperties } from "react";

type PageProps = {
    searchParams?: Promise<{
        section?: string;
        page?: string;
    }>;
};

async function createCaptionExample(formData: FormData) {
    "use server";

    const supabase = await createClient();

    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        throw new Error("User must be logged in.");
    }

    const filteredEntries = Array.from(formData.entries()).filter(
        ([key]) =>
            !key.startsWith("$") &&
            key !== "created_by_user_id" &&
            key !== "modified_by_user_id" &&
            key !== "created_datetime_utc" &&
            key !== "modified_datetime_utc"
    );

    const payload: Record<string, string | null> = Object.fromEntries(
        filteredEntries.map(([key, value]) => [key, value === "" ? null : String(value)])
    );

    const { error } = await supabase.from("caption_examples").insert([
        {
            ...payload,
            created_by_user_id: user.id,
            modified_by_user_id: user.id,
        },
    ]);

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath("/admin/caption_examples");
}

async function updateCaptionExample(formData: FormData) {
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
        .from("caption_examples")
        .update(payload)
        .eq("id", id);

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath("/admin/caption_examples");
}

async function deleteCaptionExample(formData: FormData) {
    "use server";

    const supabase = await createClient();

    const id = formData.get("id");
    if (!id) {
        throw new Error("Missing id");
    }

    const { error } = await supabase
        .from("caption_examples")
        .delete()
        .eq("id", id);

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath("/admin/caption_examples");
}

export default async function CaptionExamplesPage({ searchParams }: PageProps) {
    const supabase = await createClient();

    const params = await searchParams;
    const page = Math.max(Number(params?.page ?? "1"), 1);

    const pageSize = 100;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
        .from("caption_examples")
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

    const totalRows = count ?? 0;
    const hasNextPage = to + 1 < totalRows;

    return (
        <main style={{ padding: 24, minHeight: "100vh" }}>
            <h1 className={adelia.className}>Caption Examples</h1>

            <section style={sectionStyle}>
                <h2 className={fors.className} style={sectionTitleStyle}>
                    Create Caption Example
                </h2>

                <form action={createCaptionExample} style={formGridStyle}>
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
                        Create
                    </button>
                </form>
            </section>

            <section style={sectionStyle}>
                <h2 className={fors.className} style={sectionTitleStyle}>
                    Update Caption Example
                </h2>

                <div
                    className={fors.className}
                    style={{ marginBottom: 12, fontSize: 14 }}
                >
                    Fill in the existing <strong>id</strong> and only the fields you want to
                    update.
                </div>

                <form action={updateCaptionExample} style={formGridStyle}>
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

            <section style={sectionStyle}>
                <h2 className={fors.className} style={sectionTitleStyle}>
                    Delete Caption Example
                </h2>

                <form action={deleteCaptionExample} style={inlineFormStyle}>
                    <input
                        name="id"
                        placeholder="Enter id"
                        style={inputStyle}
                        required
                    />
                    <button
                        type="submit"
                        className={fors.className}
                        style={deleteButtonStyle}
                    >
                        Delete
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
                                section: "caption-examples",
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
                                section: "caption-examples",
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

const sectionStyle: CSSProperties = {
    marginBottom: 28,
    padding: 16,
    border: "1px solid #ddd",
    borderRadius: 12,
    backgroundColor: "#fff",
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

const buttonStyle: CSSProperties = {
    padding: "6px 10px",
    border: "1px solid #ccc",
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
    cursor: "pointer",
    fontSize: 14,
    alignSelf: "end",
    width: "fit-content",
};

const deleteButtonStyle: CSSProperties = {
    padding: "10px 14px",
    border: "1px solid #c00",
    borderRadius: 8,
    backgroundColor: "#fff5f5",
    color: "#c00",
    cursor: "pointer",
    fontSize: 14,
};

const inlineFormStyle: CSSProperties = {
    display: "flex",
    gap: 12,
    alignItems: "center",
    flexWrap: "wrap",
};

const navButtonStyle: CSSProperties = {
    textDecoration: "none",
    color: "black",
    border: "1px solid #ccc",
    padding: "8px 14px",
    borderRadius: "10px",
    backgroundColor: "#f5f5f5",
};