import ScrollingImageWallClient from "../components/ScrollingImageWallClient";
import ExpandableTable from "../components/ExpandableTable";

import { createClient } from "../../../lib/supabase/server";
import { adelia, fors } from "../fonts/fonts";
import Link from "next/link";

async function createImage(formData: FormData) {
    "use server";

    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const url = String(formData.get("url") ?? "").trim();
    if (!url) return;

    const id = crypto.randomUUID();

    const { error } = await supabase.from("images").insert({
        id,
        url,
        created_by_user_id: user.id,
        modified_by_user_id: user.id,
    });

    if (error) {
        console.error(error);
    }
}

async function updateImageByUrl(formData: FormData) {
    "use server";

    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const oldUrl = String(formData.get("oldUrl") ?? "").trim();
    const newUrl = String(formData.get("newUrl") ?? "").trim();
    if (!oldUrl || !newUrl) return;

    const { error } = await supabase
        .from("images")
        .update({
            url: newUrl,
            modified_by_user_id: user.id,
        })
        .eq("url", oldUrl);

    if (error) {
        console.error(error);
    }
}

async function deleteImageByUrl(formData: FormData) {
    "use server";

    const supabase = await createClient();

    const url = String(formData.get("url") ?? "").trim();
    if (!url) return;

    await supabase.from("images").delete().eq("url", url);
}

export default async function AdminImagesPage({
                                                  searchParams,
                                              }: {
    searchParams?: Promise<{ lookup?: string; page?: string; section?: string }>;
}) {
    const supabase = await createClient();

    const params = (await searchParams) ?? {};

    const lookupUrl = String(params.lookup ?? "").trim();
    const page = Math.max(Number(params.page ?? "1"), 1);

    const pageSize = 100;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data: tableData, error: tableError } = await supabase
        .from("images")
        .select("*", { count: "exact" })
        .order("created_datetime_utc", { ascending: false })
        .range(from, to);

    if (tableError) {
        return (
            <main style={{ padding: 24 }}>
                <h1>Images</h1>
                <pre>{JSON.stringify(tableError, null, 2)}</pre>
            </main>
        );
    }

    const rows = tableData ?? [];
    const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

    const { data: galleryData, error: galleryError } = await supabase
        .from("images")
        .select("url")
        .not("url", "is", null)
        .limit(500);

    if (galleryError) {
        return (
            <main style={{ padding: 24 }}>
                <h1>Images</h1>
                <pre>{JSON.stringify(galleryError, null, 2)}</pre>
            </main>
        );
    }

    const uniqueUrls = Array.from(
        new Set((galleryData ?? []).map((r) => r.url).filter(Boolean))
    );

    let matchedImage: { url: string } | null = null;

    if (lookupUrl) {
        const { data: foundImage } = await supabase
            .from("images")
            .select("url")
            .eq("url", lookupUrl)
            .maybeSingle();

        if (foundImage?.url) {
            matchedImage = foundImage;
        }
    }

    return (
        <main style={{ padding: 24 }}>
            <h1 className={adelia.className}>Images</h1>

            <h2 className={fors.className}>Add Image</h2>
            <form action={createImage} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                    name="url"
                    placeholder="https://example.com/image.jpg"
                    style={{ flex: 1, padding: 8, border: "1px solid #ccc", borderRadius: 6 }}
                    className={fors.className}
                />
                <button
                    type="submit"
                    style={{ fontSize: "15px", fontWeight: "bold" }}
                    className={fors.className}
                >
                    Create
                </button>
            </form>

            <hr style={{ margin: "24px 0" }} />

            <h2 className={fors.className}>Update Existing Image</h2>
            <form
                action={updateImageByUrl}
                style={{ display: "grid", gap: 8, maxWidth: 900 }}
                className={fors.className}
            >
                <input
                    name="oldUrl"
                    placeholder="Old Image URL"
                    style={{ padding: 8, border: "1px solid #ccc", borderRadius: 6 }}
                    className={fors.className}
                />
                <input
                    name="newUrl"
                    placeholder="New Image URL"
                    style={{ padding: 8, border: "1px solid #ccc", borderRadius: 6 }}
                    className={fors.className}
                />
                <button
                    type="submit"
                    style={{ width: "fit-content", fontSize: "15px", fontWeight: "bold" }}
                    className={fors.className}
                >
                    Update
                </button>
            </form>

            <hr style={{ margin: "24px 0" }} />

            <h2 className={fors.className}>Delete Image</h2>
            <form action={deleteImageByUrl} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                    name="url"
                    placeholder="https://example.com/image.jpg"
                    style={{ flex: 1, padding: 8, border: "1px solid #ccc", borderRadius: 6 }}
                    className={fors.className}
                />
                <button
                    type="submit"
                    style={{ border: "1px solid #c00", color: "#c00", fontSize: "15px", fontWeight: "bold" }}
                    className={fors.className}
                >
                    Delete
                </button>
            </form>

            <hr style={{ margin: "24px 0" }} />

            <h2 className={fors.className}>Display Image by URL</h2>
            <form method="get" style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input type="hidden" name="section" value="images" />
                <input
                    name="lookup"
                    defaultValue={lookupUrl}
                    placeholder="https://example.com/image.jpg"
                    style={{ flex: 1, padding: 8, border: "1px solid #ccc", borderRadius: 6 }}
                    className={fors.className}
                />
                <button
                    type="submit"
                    style={{ fontSize: "15px", fontWeight: "bold" }}
                    className={fors.className}
                >
                    Display
                </button>
            </form>

            {lookupUrl && (
                <div style={{ marginTop: 20 }}>
                    {matchedImage ? (
                        <>
                            <p className={fors.className} style={{ fontWeight: "bold" }}>
                                Matching image:
                            </p>
                            <img
                                src={matchedImage.url}
                                alt="Looked up image"
                                style={{
                                    maxWidth: "400px",
                                    width: "100%",
                                    height: "auto",
                                    borderRadius: 12,
                                    border: "1px solid #ccc",
                                }}
                            />
                        </>
                    ) : (
                        <p className={fors.className}>No image found for that URL.</p>
                    )}
                </div>
            )}

            <hr style={{ margin: "24px 0" }} />

            <h2 className={fors.className}>Images Table</h2>

            <div
                className={fors.className}
                style={{ marginTop: 8, marginBottom: 16, fontSize: 16 }}
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
                            query: lookupUrl
                                ? {
                                    section: "images",
                                    page: String(page - 1),
                                    lookup: lookupUrl,
                                }
                                : {
                                    section: "images",
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
                            query: lookupUrl
                                ? {
                                    section: "images",
                                    page: String(page + 1),
                                    lookup: lookupUrl,
                                }
                                : {
                                    section: "images",
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

            {/*<hr style={{ margin: "24px 0" }} />*/}
            {/*<ScrollingImageWallClient urls={uniqueUrls} rows={6} height={140} />*/}
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