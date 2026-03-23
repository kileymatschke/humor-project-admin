import ScrollingImageWallClient from "../components/ScrollingImageWallClient";
import ExpandableTable from "../components/ExpandableTable";

import { createClient } from "../../../lib/supabase/server";
import { adelia, fors } from "../fonts/fonts";
import Link from "next/link";

const PIPELINE_BASE_URL = "https://api.almostcrackd.ai";

const ALLOWED_IMAGE_TYPES = new Set([
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/heic",
]);

async function getUserAndToken() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const {
        data: { session },
    } = await supabase.auth.getSession();

    const token = session?.access_token;

    return { supabase, user, token };
}

function parseBoolean(value: FormDataEntryValue | null) {
    return String(value) === "true";
}

function parseOptionalString(value: FormDataEntryValue | null) {
    if (typeof value !== "string") return null;
    const text = value.trim();
    return text.length > 0 ? text : null;
}

async function generatePipelinePresignedUrl(contentType: string, token: string) {
    const response = await fetch(`${PIPELINE_BASE_URL}/pipeline/generate-presigned-url`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ contentType }),
        cache: "no-store",
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`generate-presigned-url failed: ${response.status} ${text}`);
    }

    return response.json() as Promise<{
        presignedUrl: string;
        cdnUrl: string;
    }>;
}

async function uploadImageBytesToPresignedUrl(presignedUrl: string, file: File) {
    const response = await fetch(presignedUrl, {
        method: "PUT",
        headers: {
            "Content-Type": file.type,
        },
        body: file,
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`presigned upload failed: ${response.status} ${text}`);
    }
}

async function registerImageUrlWithPipeline(
    imageUrl: string,
    token: string,
    isCommonUse: boolean
) {
    const response = await fetch(`${PIPELINE_BASE_URL}/pipeline/upload-image-from-url`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            imageUrl,
            isCommonUse,
        }),
        cache: "no-store",
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`upload-image-from-url failed: ${response.status} ${text}`);
    }

    const data = await response.json();
    console.log("registerImageUrlWithPipeline response:", data);
    return data;
}

function extractFinalImageUrl(registerResult: any): string {
    const finalUrl =
        registerResult?.imageUrl ??
        registerResult?.url ??
        registerResult?.finalUrl ??
        registerResult?.processedImageUrl ??
        "";

    if (
        typeof finalUrl !== "string" ||
        !finalUrl.startsWith("https://images.almostcrackd.ai/")
    ) {
        throw new Error(
            "Pipeline registration did not return a final images.almostcrackd.ai URL."
        );
    }

    return finalUrl;
}

async function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function upsertImageRowByUrl({
                                       url,
                                       userId,
                                       isCommonUse,
                                       isPublic,
                                       additionalContext,
                                       imageDescription,
                                   }: {
    url: string;
    userId: string;
    isCommonUse: boolean;
    isPublic: boolean;
    additionalContext: string | null;
    imageDescription: string | null;
}) {
    const supabase = await createClient();

    const payload = {
        url,
        modified_by_user_id: userId,
        is_common_use: isCommonUse,
        is_public: isPublic,
        additional_context: additionalContext,
        image_description: imageDescription,
    };

    const { data, error } = await supabase
        .from("images")
        .upsert(payload, { onConflict: "url" })
        .select()
        .single();

    if (error) {
        throw new Error(`Supabase upsert failed: ${error.message}`);
    }

    return data;
}

async function verifyAndRepairImageMetadata({
                                                url,
                                                userId,
                                                isCommonUse,
                                                isPublic,
                                                additionalContext,
                                                imageDescription,
                                            }: {
    url: string;
    userId: string;
    isCommonUse: boolean;
    isPublic: boolean;
    additionalContext: string | null;
    imageDescription: string | null;
}) {
    const supabase = await createClient();

    for (let attempt = 0; attempt < 5; attempt++) {
        const { data: row, error: selectError } = await supabase
            .from("images")
            .select(
                "id,url,additional_context,image_description,is_common_use,is_public,modified_by_user_id"
            )
            .eq("url", url)
            .maybeSingle();

        if (selectError) {
            throw new Error(`Supabase select failed: ${selectError.message}`);
        }

        if (!row?.id) {
            await sleep(1000);
            continue;
        }

        const contextMatches =
            (row.additional_context ?? null) === additionalContext;
        const descriptionMatches =
            (row.image_description ?? null) === imageDescription;
        const commonUseMatches = row.is_common_use === isCommonUse;
        const publicMatches = row.is_public === isPublic;

        if (
            contextMatches &&
            descriptionMatches &&
            commonUseMatches &&
            publicMatches
        ) {
            return row;
        }

        const { data: repairedRow, error: updateError } = await supabase
            .from("images")
            .update({
                modified_by_user_id: userId,
                is_common_use: isCommonUse,
                is_public: isPublic,
                additional_context: additionalContext,
                image_description: imageDescription,
            })
            .eq("id", row.id)
            .select()
            .single();

        if (updateError) {
            throw new Error(`Supabase repair update failed: ${updateError.message}`);
        }

        await sleep(1000);

        if (attempt === 4) {
            return repairedRow;
        }
    }

    throw new Error("Unable to verify image metadata after multiple attempts.");
}

async function createImageEntry(formData: FormData) {
    "use server";

    const { user, token } = await getUserAndToken();

    if (!user) {
        console.error("No authenticated user.");
        return;
    }

    if (!token) {
        console.error("No access token found for authenticated user.");
        return;
    }

    const file = formData.get("imageFile");

    const isCommonUse = parseBoolean(formData.get("is_common_use"));
    const isPublic = parseBoolean(formData.get("is_public"));
    const additionalContext = parseOptionalString(formData.get("additional_context"));
    const imageDescription = parseOptionalString(formData.get("image_description"));

    try {
        if (!(file instanceof File) || file.size === 0) {
            throw new Error("Please upload an image file.");
        }

        if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
            throw new Error(`Unsupported file type: ${file.type}`);
        }

        const { presignedUrl, cdnUrl } = await generatePipelinePresignedUrl(
            file.type,
            token
        );

        await uploadImageBytesToPresignedUrl(presignedUrl, file);

        const registerResult = await registerImageUrlWithPipeline(
            cdnUrl,
            token,
            isCommonUse
        );

        const finalUrl = extractFinalImageUrl(registerResult);

        console.log("Creating/updating images row with metadata:", {
            finalUrl,
            additionalContext,
            imageDescription,
            isCommonUse,
            isPublic,
        });

        const upsertedRow = await upsertImageRowByUrl({
            url: finalUrl,
            userId: user.id,
            isCommonUse,
            isPublic,
            additionalContext,
            imageDescription,
        });

        console.log("Initial upserted image row:", upsertedRow);

        const verifiedRow = await verifyAndRepairImageMetadata({
            url: finalUrl,
            userId: user.id,
            isCommonUse,
            isPublic,
            additionalContext,
            imageDescription,
        });

        console.log("Verified final image row:", verifiedRow);
    } catch (error) {
        console.error("Failed to create image row:", error);
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

    const { error } = await supabase.from("images").delete().eq("url", url);

    if (error) {
        console.error(error);
    }
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

            <section style={sectionStyle}>
                <h2 className={fors.className} style={sectionTitleStyle}>
                    Add Image
                </h2>

                <form
                    action={createImageEntry}
                    style={{ ...formGridStyle, maxWidth: 900 }}
                >
                    <label className={fors.className} style={fieldLabelStyle}>
                        <span>Image File</span>
                        <input
                            type="file"
                            name="imageFile"
                            accept=".jpg,.jpeg,.png,.webp,.gif,.heic,image/jpeg,image/jpg,image/png,image/webp,image/gif,image/heic"
                            style={{ padding: 8 }}
                            className={fors.className}
                            required
                        />
                    </label>

                    {/*<div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>*/}
                    {/*    <label className={fors.className} style={fieldLabelStyle}>*/}
                    {/*        <span>Is Common Use?</span>*/}
                    {/*        <select*/}
                    {/*            name="is_common_use"*/}
                    {/*            defaultValue="false"*/}
                    {/*            style={selectStyle}*/}
                    {/*            className={fors.className}*/}
                    {/*            required*/}
                    {/*        >*/}
                    {/*            <option value="false">False</option>*/}
                    {/*            <option value="true">True</option>*/}
                    {/*        </select>*/}
                    {/*    </label>*/}

                    {/*    <label className={fors.className} style={fieldLabelStyle}>*/}
                    {/*        <span>Is Public?</span>*/}
                    {/*        <select*/}
                    {/*            name="is_public"*/}
                    {/*            defaultValue="false"*/}
                    {/*            style={selectStyle}*/}
                    {/*            className={fors.className}*/}
                    {/*            required*/}
                    {/*        >*/}
                    {/*            <option value="false">False</option>*/}
                    {/*            <option value="true">True</option>*/}
                    {/*        </select>*/}
                    {/*    </label>*/}
                    {/*</div>*/}

                    {/*<label className={fors.className} style={fieldLabelStyle}>*/}
                    {/*    <span>Additional Context</span>*/}
                    {/*    <textarea*/}
                    {/*        name="additional_context"*/}
                    {/*        placeholder="Optional notes about the image..."*/}
                    {/*        rows={4}*/}
                    {/*        style={textareaStyle}*/}
                    {/*        className={fors.className}*/}
                    {/*    />*/}
                    {/*</label>*/}

                    {/*<label className={fors.className} style={fieldLabelStyle}>*/}
                    {/*    <span>Image Description (Optional)</span>*/}
                    {/*    <textarea*/}
                    {/*        name="image_description"*/}
                    {/*        placeholder="Optional image description..."*/}
                    {/*        rows={4}*/}
                    {/*        style={textareaStyle}*/}
                    {/*        className={fors.className}*/}
                    {/*    />*/}
                    {/*</label>*/}

                    <button
                        type="submit"
                        style={primaryButtonStyle}
                        className={fors.className}
                    >
                        Create
                    </button>
                </form>
            </section>

            <section style={sectionStyle}>
                <h2 className={fors.className} style={sectionTitleStyle}>
                    Update Existing Image
                </h2>

                <form
                    action={updateImageByUrl}
                    style={{ ...formGridStyle, maxWidth: 900 }}
                    className={fors.className}
                >
                    <input
                        name="oldUrl"
                        placeholder="Old Image URL"
                        style={textInputStyle}
                        className={fors.className}
                    />
                    <input
                        name="newUrl"
                        placeholder="New Image URL"
                        style={textInputStyle}
                        className={fors.className}
                    />
                    <button
                        type="submit"
                        style={primaryButtonStyle}
                        className={fors.className}
                    >
                        Update
                    </button>
                </form>
            </section>

            <section style={sectionStyle}>
                <h2 className={fors.className} style={sectionTitleStyle}>
                    Delete Image by URL
                </h2>

                <form action={deleteImageByUrl} style={inlineFormStyle}>
                    <input
                        name="url"
                        placeholder="https://images.almostcrackd.ai/..."
                        style={{ ...textInputStyle, flex: 1, minWidth: 260 }}
                        className={fors.className}
                    />
                    <button
                        type="submit"
                        style={dangerButtonStyle}
                        className={fors.className}
                    >
                        Delete
                    </button>
                </form>
            </section>

            <section style={sectionStyle}>
                <h2 className={fors.className} style={sectionTitleStyle}>
                    Display Image by URL
                </h2>

                <form method="get" style={inlineFormStyle}>
                    <input type="hidden" name="section" value="images" />
                    <input
                        name="lookup"
                        defaultValue={lookupUrl}
                        placeholder="https://images.almostcrackd.ai/..."
                        style={{ ...textInputStyle, flex: 1, minWidth: 260 }}
                        className={fors.className}
                    />
                    <button
                        type="submit"
                        style={primaryButtonStyle}
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
            </section>

            <section style={sectionStyle}>
                <h2 className={fors.className} style={sectionTitleStyle}>
                    Images Table
                </h2>

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
            </section>
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
    gap: 12,
};

const inlineFormStyle: React.CSSProperties = {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    alignItems: "center",
};

const fieldLabelStyle: React.CSSProperties = {
    display: "grid",
    gap: 4,
};

const textInputStyle: React.CSSProperties = {
    padding: 8,
    border: "1px solid #ccc",
    borderRadius: 6,
};

const textareaStyle: React.CSSProperties = {
    padding: 8,
    border: "1px solid #ccc",
    borderRadius: 6,
};

const selectStyle: React.CSSProperties = {
    padding: 8,
    borderRadius: 6,
};

const primaryButtonStyle: React.CSSProperties = {
    width: "fit-content",
    fontSize: "15px",
    fontWeight: "bold",
};

const dangerButtonStyle: React.CSSProperties = {
    border: "1px solid #c00",
    color: "#c00",
    fontSize: "15px",
    fontWeight: "bold",
    backgroundColor: "transparent",
    padding: "8px 14px",
    borderRadius: "10px",
};

const navButtonStyle: React.CSSProperties = {
    textDecoration: "none",
    color: "black",
    border: "1px solid #ccc",
    padding: "8px 14px",
    borderRadius: "10px",
    backgroundColor: "#f5f5f5",
};