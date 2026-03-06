"use client";

import dynamic from "next/dynamic";

const ScrollingImageWall = dynamic(
    () => import("./ScrollingImageWall"),
    { ssr: false }
);

type Props = {
    urls: string[];
    rows?: number;
    height?: number;
};

export default function ScrollingImageWallClient({ urls, rows, height }: Props) {
    return <ScrollingImageWall urls={urls} rows={rows} height={height} />;
}