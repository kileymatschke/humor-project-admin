import Link from "next/link";
import { createClient } from "../../../lib/supabase/server";
import { adelia, fors } from "../fonts/fonts";
import ExpandableTable from "../components/ExpandableTable";

type PageProps = {
    searchParams?: Promise<{
        section?: string;
        page?: string;
    }>;
};

type CaptionRow = {
    id?: string | number;
    image_id?: string | number | null;
    content?: string | null;
    like_count?: number | null;
    is_public?: boolean | null;
    created_datetime_utc?: string | null;
    [key: string]: unknown;
};

type ImageRow = {
    id: string | number;
    url?: string | null; // change this if your images table uses a different column name
};

export default async function CaptionsPage({ searchParams }: PageProps) {
    const supabase = await createClient();

    const params = await searchParams;
    const page = Math.max(Number(params?.page ?? "1"), 1);

    const pageSize = 100;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const [
        paginatedResult,
        totalCountResult,
        publicCountResult,
        captionStatsResult,
        topCaptionsResult,
        bottomCaptionsResult,
    ] = await Promise.all([
        supabase
            .from("captions")
            .select("*", { count: "exact" })
            .order("created_datetime_utc", { ascending: false })
            .range(from, to),

        supabase
            .from("captions")
            .select("*", { count: "exact", head: true }),

        supabase
            .from("captions")
            .select("*", { count: "exact", head: true })
            .eq("is_public", true),

        supabase
            .from("captions")
            .select("content"),

        supabase
            .from("captions")
            .select("id, image_id, content, like_count")
            .order("like_count", { ascending: false, nullsFirst: false })
            .limit(5),

        supabase
            .from("captions")
            .select("id, image_id, content, like_count")
            .order("like_count", { ascending: true, nullsFirst: false })
            .limit(5),
    ]);

    const { data, error } = paginatedResult;

    if (
        error ||
        totalCountResult.error ||
        publicCountResult.error ||
        captionStatsResult.error ||
        topCaptionsResult.error ||
        bottomCaptionsResult.error
    ) {
        return (
            <main style={{ padding: 24 }}>
                <h1>Error</h1>
                <pre>
                    {JSON.stringify(
                        {
                            pageError: error,
                            totalCountError: totalCountResult.error,
                            publicCountError: publicCountResult.error,
                            captionStatsError: captionStatsResult.error,
                            topCaptionsError: topCaptionsResult.error,
                            bottomCaptionsError: bottomCaptionsResult.error,
                        },
                        null,
                        2
                    )}
                </pre>
            </main>
        );
    }

    const rows: CaptionRow[] = data ?? [];
    const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

    const totalCaptions = totalCountResult.count ?? 0;
    const publicCaptions = publicCountResult.count ?? 0;

    const publicPercentage =
        totalCaptions > 0 ? (publicCaptions / totalCaptions) * 100 : 0;

    const captionsForStats = (captionStatsResult.data ?? []) as Pick<
        CaptionRow,
        "content"
    >[];

    let totalWords = 0;
    let shortestCaption = "";
    let longestCaption = "";

    const wordCounts = new Map<string, number>();

    for (const row of captionsForStats) {
        const text = typeof row.content === "string" ? row.content.trim() : "";
        if (!text) continue;

        const words = text
            .toLowerCase()
            .replace(/[^\w\s']/g, " ")
            .split(/\s+/)
            .filter(Boolean);

        totalWords += words.length;

        for (const word of words) {
            wordCounts.set(word, (wordCounts.get(word) ?? 0) + 1);
        }

        if (!shortestCaption || text.length < shortestCaption.length) {
            shortestCaption = text;
        }

        if (!longestCaption || text.length > longestCaption.length) {
            longestCaption = text;
        }
    }

    const averageWordCount =
        captionsForStats.length > 0 ? totalWords / captionsForStats.length : 0;

    const topWords = Array.from(wordCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

    const topCaptions = (topCaptionsResult.data ?? []) as Pick<
        CaptionRow,
        "id" | "image_id" | "content" | "like_count"
    >[];

    const bottomCaptions = (bottomCaptionsResult.data ?? []) as Pick<
        CaptionRow,
        "id" | "image_id" | "content" | "like_count"
    >[];

    const imageIds = [...topCaptions, ...bottomCaptions]
        .map((caption) => caption.image_id)
        .filter((id): id is string | number => id !== null && id !== undefined);

    const uniqueImageIds = Array.from(new Set(imageIds.map(String)));

    const { data: topImages, error: topImagesError } =
        uniqueImageIds.length > 0
            ? await supabase
                .from("images")
                .select("id, url")
                .in("id", uniqueImageIds)
            : { data: [], error: null };

    if (topImagesError) {
        return (
            <main style={{ padding: 24 }}>
                <h1>Error</h1>
                <pre>{JSON.stringify(topImagesError, null, 2)}</pre>
            </main>
        );
    }

    const imageMap = new Map<string, ImageRow>();
    (topImages ?? []).forEach((img: ImageRow) => {
        imageMap.set(String(img.id), img);
    });

    return (
        <main style={{ padding: 24, minHeight: "100vh", color: "#83932D" }}>
            <h1 className={adelia.className}>Captions</h1>

            <section
                style={{
                    marginTop: 24,
                    marginBottom: 32,
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                    gap: 16,
                }}
            >
                <StatCard
                    label="Total captions"
                    value={totalCaptions.toLocaleString()}
                />

                <StatCard
                    label="Captions set to 'public'"
                    value={`${publicPercentage.toFixed(1)}%`}
                    // subtext={`${publicCaptions.toLocaleString()} of ${totalCaptions.toLocaleString()}`}
                />
                <StatCard
                    label="Average word count"
                    value={averageWordCount.toFixed(1)}
                />
                <StatCard
                    label="Top 3 most frequent words"
                    value={
                        topWords.length > 0
                            ? topWords.map(([word]) => word).join(", ")
                            : "None"
                    }
                    // subtext={
                    //     topWords.length > 0
                    //         ? topWords
                    //             .map(([word, count]) => `${word} (${count})`)
                    //             .join(" • ")
                    //         : undefined
                    // }
                />
                {/*<StatCard*/}
                {/*    label="Shortest caption"*/}
                {/*    value={shortestCaption || "None"}*/}
                {/*/>*/}
                {/*<StatCard*/}
                {/*    label="Longest caption"*/}
                {/*    value={longestCaption || "None"}*/}
                {/*/>*/}
            </section>

            <section
                style={{
                    marginBottom: 32,
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))",
                    gap: 20,
                    alignItems: "start",
                }}
            >
                <div
                    style={{
                        padding: 20,
                        border: "1px solid #ccc",
                        borderRadius: 16,
                        backgroundColor: "#F7F9ED",
                    }}
                >
                    <h2
                        className={fors.className}
                        style={{ marginTop: 0, marginBottom: 16, fontSize: 22 }}
                    >
                        Highest-rated captions
                    </h2>

                    <CaptionList captions={topCaptions} imageMap={imageMap} />
                </div>

                <div
                    style={{
                        padding: 20,
                        border: "1px solid #ccc",
                        borderRadius: 16,
                        backgroundColor: "#F7F9ED",
                    }}
                >
                    <h2
                        className={fors.className}
                        style={{ marginTop: 0, marginBottom: 16, fontSize: 22 }}
                    >
                        Lowest-rated captions
                    </h2>

                    <CaptionList captions={bottomCaptions} imageMap={imageMap} />
                </div>
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
                                section: "captions",
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
                                section: "captions",
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

function StatCard({
                      label,
                      value,
                      subtext,
                  }: {
    label: string;
    value: string;
    subtext?: string;
}) {
    return (
        <div
            style={{
                padding: 20,
                border: "1px solid #ccc",
                borderRadius: 16,
                backgroundColor: "#F7F9ED",
                minHeight: 80,
            }}
        >
            <div
                className={fors.className}
                style={{
                    fontSize: 16,
                    color: "#666",
                    marginBottom: 8,
                }}
            >
                {label}
            </div>

            <div
                className={fors.className}
                style={{
                    fontSize: 24,
                    fontWeight: 600,
                    lineHeight: 1.25,
                    overflowWrap: "anywhere",
                    wordBreak: "break-word",
                }}
            >
                {value}
            </div>

            {subtext && (
                <div
                    className={fors.className}
                    style={{
                        fontSize: 13,
                        color: "#777",
                        marginTop: 8,
                        lineHeight: 1.4,
                    }}
                >
                    {subtext}
                </div>
            )}
        </div>
    );
}

function CaptionList({
                         captions,
                         imageMap,
                     }: {
    captions: Pick<CaptionRow, "id" | "image_id" | "content" | "like_count">[];
    imageMap: Map<string, ImageRow>;
}) {
    return (
        <div style={{ display: "grid", gap: 12 }}>
            {captions.map((caption, index) => {
                const image =
                    caption.image_id != null
                        ? imageMap.get(String(caption.image_id))
                        : undefined;

                return (
                    <div
                        key={String(caption.id ?? index)}
                        style={{
                            padding: 14,
                            border: "1px solid #ccc",
                            borderRadius: 12,
                            backgroundColor: "white",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            gap: 16,
                        }}
                    >
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                                className={fors.className}
                                style={{
                                    fontSize: 14,
                                    color: "#555",
                                    marginBottom: 6,
                                }}
                            >
                                #{index + 1} · {caption.like_count ?? 0} likes
                            </div>

                            <div
                                className={fors.className}
                                style={{
                                    fontSize: 16,
                                    lineHeight: 1.5,
                                    overflowWrap: "anywhere",
                                }}
                            >
                                {caption.content || "No caption text"}
                            </div>
                        </div>

                        <div
                            style={{
                                width: 72,
                                minWidth: 72,
                                height: 72,
                                borderRadius: 10,
                                overflow: "hidden",
                                border: "1px solid #ddd",
                                backgroundColor: "#f2f2f2",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            {image?.url ? (
                                <img
                                    src={image.url}
                                    alt={`Thumbnail for caption ${index + 1}`}
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                        display: "block",
                                    }}
                                />
                            ) : (
                                <span
                                    className={fors.className}
                                    style={{
                                        fontSize: 12,
                                        color: "#777",
                                        textAlign: "center",
                                        padding: 6,
                                    }}
                                >
                                    No image
                                </span>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
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