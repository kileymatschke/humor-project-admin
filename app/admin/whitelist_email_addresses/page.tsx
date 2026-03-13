import { revalidatePath } from "next/cache";
import Link from "next/link";
import { createClient } from "../../../lib/supabase/server";
import { adelia, fors, kindergarten } from "../fonts/fonts";
import ExpandableTable from "../components/ExpandableTable";

type PageProps = {
    searchParams?: Promise<{
        page?: string;
    }>;
};

function nowUtcTimestamp() {
    return new Date().toISOString();
}

async function createWhitelistEmailAddress(formData: FormData) {
    "use server";

    const supabase = await createClient();

    const payload: Record<string, string | null> = Object.fromEntries(
        Array.from(formData.entries())
            .filter(([key]) => !key.startsWith("$"))
            .map(([key, value]) => [key, value === "" ? null : String(value)])
    );

    const timestamp = nowUtcTimestamp();

    const { error } = await supabase.from("whitelist_email_addresses").insert([
        {
            ...payload,
            created_datetime_utc: timestamp,
            modified_datetime_utc: timestamp,
        },
    ]);

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath("/admin/whitelist_email_addresses");
}

async function updateWhitelistEmailAddress(formData: FormData) {
    "use server";

    const supabase = await createClient();

    const id = formData.get("id");
    if (!id) {
        throw new Error("Missing id");
    }

    const filteredEntries = Array.from(formData.entries()).filter(
        ([key, value]) => !key.startsWith("$") && key !== "id" && value !== ""
    );

    const payload: Record<string, string | null> = Object.fromEntries(
        filteredEntries.map(([key, value]) => [key, String(value)])
    );

    payload.modified_datetime_utc = nowUtcTimestamp();

    const { error } = await supabase
        .from("whitelist_email_addresses")
        .update(payload)
        .eq("id", id);

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath("/admin/whitelist_email_addresses");
}

async function deleteWhitelistEmailAddress(formData: FormData) {
    "use server";

    const supabase = await createClient();

    const id = formData.get("id");
    if (!id) {
        throw new Error("Missing id");
    }

    const { error } = await supabase
        .from("whitelist_email_addresses")
        .delete()
        .eq("id", id);

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath("/admin/whitelist_email_addresses");
}

export default async function WhitelistEmailAddressesPage({
                                                              searchParams,
                                                          }: PageProps) {
    const supabase = await createClient();

    const params = await searchParams;
    const page = Math.max(Number(params?.page ?? "1"), 1);

    const pageSize = 100;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error } = await supabase
        .from("whitelist_email_addresses")
        .select("*")
        .order("id", { ascending: true })
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
            col !== "created_datetime_utc" &&
            col !== "modified_datetime_utc"
    );

    return (
        <main style={{ padding: 24, minHeight: "100vh" }}>
            <h1 className={adelia.className}>Whitelist Email Addresses</h1>

            {/*<div*/}
            {/*    className={kindergarten.className}*/}
            {/*    style={{ marginTop: 6, fontSize: 16, fontWeight: 700 }}*/}
            {/*>*/}
            {/*    <Link href="/" style={{ textDecoration: "none", color: "black" }}>*/}
            {/*        ← Back to dashboard*/}
            {/*    </Link>*/}
            {/*</div>*/}



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
                    Create Whitelist Email Address
                </h2>

                <form action={createWhitelistEmailAddress} style={formGridStyle}>
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
                    Update Whitelist Email Address
                </h2>

                <div
                    className={fors.className}
                    style={{ marginBottom: 12, fontSize: 14 }}
                >
                    Fill in the <strong>id</strong> and only the fields you want to
                    change.
                </div>

                <form action={updateWhitelistEmailAddress} style={formGridStyle}>
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
                    Delete Whitelist Email Address
                </h2>

                <form action={deleteWhitelistEmailAddress} style={inlineFormStyle}>
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


            <ExpandableTable rows={rows} columns={columns} />
        </main>
    );
}

const sectionStyle: React.CSSProperties = {
    marginBottom: 28,
    padding: 16,
    border: "1px solid #ddd",
    borderRadius: 12,
    backgroundColor: "#fff",
};

const sectionTitleStyle: React.CSSProperties = {
    marginTop: 0,
    marginBottom: 14,
};

const formGridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 12,
};

const inlineFormStyle: React.CSSProperties = {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    alignItems: "center",
};

const labelStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: 6,
};

const inputStyle: React.CSSProperties = {
    padding: "10px 12px",
    border: "1px solid #ccc",
    borderRadius: 8,
};

const buttonStyle: React.CSSProperties = {
    padding: "6px 10px",
    border: "1px solid #ccc",
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
    cursor: "pointer",
    fontSize: 14,
    alignSelf: "end",
    width: "fit-content",
};


const deleteButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: "#ffe5e5",
};

const navButtonStyle: React.CSSProperties = {
    textDecoration: "none",
    color: "black",
    border: "1px solid #ccc",
    padding: "8px 14px",
    borderRadius: "10px",
    backgroundColor: "#f5f5f5",
};
