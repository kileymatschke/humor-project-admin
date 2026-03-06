"use client";

import { useMemo, useState } from "react";

function chunkIntoRows<T>(items: T[], rows: number) {
    const out: T[][] = Array.from({ length: rows }, () => []);
    items.forEach((item, i) => out[i % rows].push(item));
    return out;
}

function isValidUrl(url: string) {
    if (!url || typeof url !== "string") return false;

    const trimmed = url.trim();
    if (!trimmed) return false;

    try {
        new URL(trimmed);
        return true;
    } catch {
        return false;
    }
}

export default function ScrollingImageWall({
                                               urls,
                                               rows = 6,
                                               height = 140,
                                           }: {
    urls: string[];
    rows?: number;
    height?: number;
}) {
    const validUrls = useMemo(() => {
        return urls.filter(isValidUrl);
    }, [urls]);

    const [failedUrls, setFailedUrls] = useState<Set<string>>(new Set());

    const visibleUrls = useMemo(() => {
        return validUrls.filter((u) => !failedUrls.has(u));
    }, [validUrls, failedUrls]);

    const filledUrls = useMemo(() => {
        if (visibleUrls.length === 0) return [];

        const min = Math.max(30, rows * 10);
        const out: string[] = [];

        for (let i = 0; i < min; i++) {
            out.push(visibleUrls[i % visibleUrls.length]);
        }

        return out;
    }, [visibleUrls, rows]);

    const rowData = useMemo(() => {
        return chunkIntoRows(filledUrls, rows);
    }, [filledUrls, rows]);

    return (
        <div className="wall">
            {rowData.map((row, idx) => {
                const doubled = [...row, ...row];

                const duration = 30 + (idx % 3) * 8;
                const reverse = idx % 2 === 1;

                return (
                    <div
                        key={idx}
                        className="row"
                        style={{ height }}
                    >
                        <div
                            className={`track ${reverse ? "reverse" : ""}`}
                            style={{ animationDuration: `${duration}s` }}
                        >
                            {doubled.map((src, i) => (
                                <div className="card" key={`${idx}-${i}-${src}`}>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={src}
                                        alt="Gallery image"
                                        loading="lazy"
                                        onError={() => {
                                            setFailedUrls((prev) => {
                                                const next = new Set(prev);
                                                next.add(src);
                                                return next;
                                            });
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}

            <style jsx>{`
                .wall {
                    margin-top: 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .row {
                    overflow: hidden;
                    border-radius: 16px;
                    border: 1px solid rgba(0, 0, 0, 0.12);
                    background: rgba(0, 0, 0, 0.02);
                    position: relative;
                }

                .row::before,
                .row::after {
                    content: "";
                    position: absolute;
                    top: 0;
                    bottom: 0;
                    width: 64px;
                    z-index: 2;
                    pointer-events: none;
                }

                .row::before {
                    left: 0;
                    background: linear-gradient(
                            to right,
                            rgba(255, 255, 255, 1),
                            rgba(255, 255, 255, 0)
                    );
                }

                .row::after {
                    right: 0;
                    background: linear-gradient(
                            to left,
                            rgba(255, 255, 255, 1),
                            rgba(255, 255, 255, 0)
                    );
                }

                .track {
                    height: 100%;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 10px 12px;
                    width: max-content;

                    animation-name: scroll;
                    animation-timing-function: linear;
                    animation-iteration-count: infinite;
                }

                .track.reverse {
                    animation-direction: reverse;
                }

                @keyframes scroll {
                    from {
                        transform: translateX(0);
                    }
                    to {
                        transform: translateX(-50%);
                    }
                }

                .card {
                    height: 100%;
                    aspect-ratio: 4 / 3;
                    border-radius: 14px;
                    overflow: hidden;
                    border: 1px solid rgba(0, 0, 0, 0.12);
                    background: white;
                    flex: 0 0 auto;
                }

                img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    display: block;
                    transition: transform 250ms ease;
                }

                .card:hover img {
                    transform: scale(1.04);
                }

                @media (prefers-reduced-motion: reduce) {
                    .track {
                        animation: none;
                    }
                }
            `}</style>
        </div>
    );
}