import ScrollingImageWallClient from "../components/ScrollingImageWallClient";

import { createClient } from "../../../lib/supabase/server";
import { adelia } from "../fonts/fonts";
import { kindergarten } from "../fonts/fonts";
import { fors } from "../fonts/fonts";
import Link from "next/link";


async function createImage(formData: FormData) {
    "use server";

    const supabase = await createClient();

    const url = String(formData.get("url") ?? "").trim();
    if (!url) return;

    const id = crypto.randomUUID(); // generates UUID like 653a7479-845a-4427-8be1-869793848ee2

    const created_datetime_utc = new Date().toISOString(); // UTC timestamp
    const modified_datetime_utc = new Date().toISOString(); // UTC timestamp

    const { error } = await supabase.from("images").insert({
        id,
        created_datetime_utc,
        modified_datetime_utc,
        url,
    });

    if (error) {
        console.error(error);
    }
}

async function updateImageByUrl(formData: FormData) {
    "use server";
    const supabase = await createClient();

    const oldUrl = String(formData.get("oldUrl") ?? "").trim();
    const newUrl = String(formData.get("newUrl") ?? "").trim();
    if (!oldUrl || !newUrl) return;

    await supabase.from("images").update({ url: newUrl }).eq("url", oldUrl);
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
    searchParams: Promise<{ lookup?: string }>;
}) {
    const supabase = await createClient();
    const params = await searchParams;
    const lookupUrl = String(params.lookup ?? "").trim();

    const { data, error } = await supabase
        .from("images")
        .select("url")
        .not("url", "is", null)
        .limit(500);

    if (error) {
        return (
            <main style={{ padding: 24 }}>
                <h1>Images</h1>
                <pre>{JSON.stringify(error, null, 2)}</pre>
            </main>
        );
    }

    const uniqueUrls = Array.from(new Set((data ?? []).map((r) => r.url).filter(Boolean)));

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

            <div
                className={kindergarten.className}
                style={{ marginTop: 6, fontSize: 16, fontWeight: 700 }}
            >
                <Link href="/" style={{ textDecoration: "none", color: "black" }}>
                    ← Back to dashboard
                </Link>
            </div>

            {/* LOOKUP */}
            <h2 className={kindergarten.className}>Look Up Image by URL</h2>
            <form method="get" style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                    name="lookup"
                    defaultValue={lookupUrl}
                    placeholder="Paste image URL here"
                    style={{ flex: 1, padding: 8, border: "1px solid #ccc", borderRadius: 6 }}
                    className={fors.className}
                />
                <button
                    type="submit"
                    style={{ fontSize: "15px", fontWeight: "bold" }}
                    className={kindergarten.className}
                >
                    Look Up
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

            {/* CREATE */}
            <h2 className={kindergarten.className}>Add Image</h2>
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
                    className={kindergarten.className}
                >
                    Create
                </button>
            </form>

            <hr style={{ margin: "24px 0" }} />

            {/* UPDATE */}
            <h2 className={kindergarten.className}>Update Existing Image</h2>
            <form action={updateImageByUrl} style={{ display: "grid", gap: 8, maxWidth: 900 }} className={fors.className}>
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
                    className={kindergarten.className}
                >
                    Update
                </button>
            </form>

            <hr style={{ margin: "24px 0" }} />

            {/* DELETE */}
            <h2 className={kindergarten.className}>Delete Image</h2>
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
                    className={kindergarten.className}
                >
                    Delete
                </button>
            </form>

            <hr style={{ margin: "24px 0" }} />



            {/* READ */}
            <ScrollingImageWallClient urls={uniqueUrls} rows={6} height={140} />        </main>
    );
}