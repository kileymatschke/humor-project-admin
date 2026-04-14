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

async function getCurrentProfileId() {
    const supabase = await createClient();

    const {
        data: { user },
        error,
    } = await supabase.auth.getUser();

    if (error) {
        throw new Error(error.message);
    }

    if (!user) {
        throw new Error("You must be signed in.");
    }

    // Assumes profiles.id matches auth.users.id
    return user.id;
}

async function createAllowedSignupDomain(formData: FormData) {
    "use server";

    const supabase = await createClient();
    const profileId = await getCurrentProfileId();

    const payload: Record<string, string | null> = Object.fromEntries(
        Array.from(formData.entries())
            .filter(
                ([key]) =>
                    !key.startsWith("$") &&
                    key !== "id" &&
                    key !== "created_by_user_id" &&
                    key !== "modified_by_user_id" &&
                    key !== "created_datetime_utc" &&
                    key !== "modified_datetime_utc"
            )
            .map(([key, value]) => [key, value === "" ? null : String(value)])
    );

    const { error } = await supabase.from("allowed_signup_domains").insert([
        {
            ...payload,
            created_by_user_id: profileId,
            modified_by_user_id: profileId,
        },
    ]);

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath("/admin/allowed_signup_domains");
}

async function updateAllowedSignupDomain(formData: FormData) {
    "use server";

    const supabase = await createClient();
    const profileId = await getCurrentProfileId();

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

    const { error } = await supabase
        .from("allowed_signup_domains")
        .update({
            ...payload,
            modified_by_user_id: profileId,
        })
        .eq("id", id);

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath("/admin/allowed_signup_domains");
}

async function deleteAllowedSignupDomain(formData: FormData) {
    "use server";

    const supabase = await createClient();

    const id = formData.get("id");
    if (!id) {
        throw new Error("Missing id");
    }

    const { error } = await supabase
        .from("allowed_signup_domains")
        .delete()
        .eq("id", id);

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath("/admin/allowed_signup_domains");
}

export default async function AllowedSignupDomainsPage({
                                                           searchParams,
                                                       }: PageProps) {
    const supabase = await createClient();

    const params = await searchParams;
    const page = Math.max(Number(params?.page ?? "1"), 1);

    const pageSize = 100;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error } = await supabase
        .from("allowed_signup_domains")
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
            <h1 className={adelia.className}>Allowed Signup Domains</h1>

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
                        className={fors.className}
                        style={navButtonStyle}
                    >
                        ← Previous
                    </Link>
                )}

                {rows.length === pageSize && (
                    <Link
                        href={`?page=${page + 1}`}
                        className={fors.className}
                        style={navButtonStyle}
                    >
                        Next →
                    </Link>
                )}
            </div>

            <section style={sectionStyle}>
                <h2 className={fors.className} style={sectionTitleStyle}>
                    Create allowed signup domain
                </h2>

                <form action={createAllowedSignupDomain} style={formGridStyle}>
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
                    Update existing allowed signup domain
                </h2>

                <div
                    className={fors.className}
                    style={{ marginBottom: 12, fontSize: 14 }}
                >
                    Fill in the existing <strong>id</strong> and new <strong>apex_domain</strong> you want to update to:
                </div>

                <form action={updateAllowedSignupDomain} style={formGridStyle}>
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
                    Delete allowed signup domain
                </h2>

                <form action={deleteAllowedSignupDomain} style={inlineFormStyle}>
                    <label style={labelStyle}>
                        <span className={fors.className}>id</span>
                        <input
                            name="id"
                            style={inputStyle}
                            required
                        />
                    </label>
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
                Page {page} ({rows.length} rows loaded)
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
    backgroundColor: "#F7F9ED",
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

const deleteButtonStyle: React.CSSProperties = {
    textDecoration: "none",
    alignSelf: "end",
    color: "#C0678C",
    fontWeight: 600,
    border: "1px solid #C0678C",
    padding: "8px 14px",
    borderRadius: "10px",
    backgroundColor: "rgba(192,103,140,0.08)",
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