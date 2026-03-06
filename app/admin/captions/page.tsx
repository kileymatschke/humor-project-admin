import { createClient } from "../../../lib/supabase/server";
import { adelia } from "../fonts/fonts";
import { fors } from "../fonts/fonts";
import { kindergarten } from "../fonts/fonts";

export default async function CaptionsPage() {
    const supabase = await createClient();

    const { data: captions, error } = await supabase
        .from("captions")
        .select("id,content");

    if (error) {
        return (
            <main style={{ padding: 24 }}>
                <h1>Captions</h1>
                <pre>{JSON.stringify(error, null, 2)}</pre>
            </main>
        );
    }

    const safeCaptions = (captions ?? []).filter(
        (caption) => caption.content && caption.content.trim() !== ""
    );

    return (
        <main style={{ padding: 24, minHeight: "100vh" }}>
            <style>{`
                @keyframes floatA {
                    0% { transform: translateY(0px) rotate(-1deg); }
                    50% { transform: translateY(-8px) rotate(1deg); }
                    100% { transform: translateY(0px) rotate(-1deg); }
                }

                @keyframes floatB {
                    0% { transform: translateY(0px) rotate(1deg); }
                    50% { transform: translateY(-10px) rotate(-1deg); }
                    100% { transform: translateY(0px) rotate(1deg); }
                }

                @keyframes floatC {
                    0% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-6px) rotate(1deg); }
                    100% { transform: translateY(0px) rotate(0deg); }
                }

                .captionsWrap {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 18px;
                    align-items: flex-start;
                    margin-top: 24px;
                }

                .captionCard {
                    min-width: 220px;
                    max-width: 320px;
                    padding: 14px 16px;
                    border-radius: 18px;
                    border: 1px solid rgba(0,0,0,0.12);
                    box-shadow: 0 8px 20px rgba(0,0,0,0.10);
                    background: rgba(255,255,255,0.85);
                    word-break: break-word;
                }

                .floatA {
                    animation: floatA 4.8s ease-in-out infinite;
                }

                .floatB {
                    animation: floatB 5.6s ease-in-out infinite;
                }

                .floatC {
                    animation: floatC 4.2s ease-in-out infinite;
                }

                @media (prefers-reduced-motion: reduce) {
                    .floatA, .floatB, .floatC {
                        animation: none !important;
                    }
                }
            `}</style>

            <h1 className={adelia.className}>Captions</h1>

            {/*<div*/}
            {/*    className={kindergarten.className}*/}
            {/*    style={{ fontSize: "20px", fontWeight: "bold", marginTop: 8 }}*/}
            {/*>*/}
            {/*    Total captions: {safeCaptions.length}*/}
            {/*</div>*/}

            <div className="captionsWrap">
                {safeCaptions.map((caption, index) => {
                    const floatClass =
                        index % 3 === 0 ? "floatA" : index % 3 === 1 ? "floatB" : "floatC";

                    return (
                        <div
                            key={caption.id}
                            className={`captionCard ${floatClass} ${fors.className}`}
                        >
                            {caption.content}
                        </div>
                    );
                })}
            </div>
        </main>
    );
}