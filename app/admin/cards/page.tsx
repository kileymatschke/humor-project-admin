import { createClient } from "../../../lib/supabase/server";
import { redirect } from "next/navigation";
import { adelia, kindergarten } from "../fonts/fonts";

const cardData = [
    { label: "Users", table: "profiles", className: "anim1" },
    { label: "Images", table: "images", className: "anim2" },
    { label: "Allowed Signup Domains", table: "allowed_signup_domains", className: "anim3" },
    { label: "Captions", table: "captions", className: "anim1" },
    { label: "Humor Flavors", table: "humor_flavors", className: "anim2" },
    { label: "Humor Flavor Steps", table: "humor_flavor_steps", className: "anim3" },
    { label: "Humor Flavor Mix", table: "humor_flavor_mix", className: "anim1" },
    { label: "Caption Requests", table: "caption_requests", className: "anim2" },
    { label: "LLM Prompt Chains", table: "llm_prompt_chains", className: "anim3" },
    { label: "LLM Model Responses", table: "llm_model_responses", className: "anim1" },
    { label: "LLM Models", table: "llm_models", className: "anim2" },
    { label: "Terms", table: "terms", className: "anim3" },
    { label: "LLM Providers", table: "llm_providers", className: "anim1" },
    { label: "Caption Examples", table: "caption_examples", className: "anim2" },
    { label: "Whitelist Email Addresses", table: "whitelist_email_addresses", className: "anim3" },
];

export default async function CardsPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    const countResults = await Promise.all(
        cardData.map(({ table }) =>
            supabase.from(table).select("*", { count: "exact", head: true })
        )
    );

    const counts = Object.fromEntries(
        cardData.map((card, index) => [
            card.table,
            countResults[index].count ?? 0,
        ])
    );

    return (
        <main
            style={{
                minHeight: "100vh",
                padding: "48px",
                background: "#fff",
            }}
        >
            <style>{`
                @keyframes float1 {
                    0% { transform: translateY(0px) translateX(0px) rotate(-1deg); }
                    50% { transform: translateY(-3px) translateX(9px) rotate(1deg); }
                    100% { transform: translateY(0px) translateX(0px) rotate(-1deg); }
                }

                @keyframes float2 {
                    0% { transform: translateY(0px) translateX(0px) rotate(1deg); }
                    50% { transform: translateY(-3px) translateX(3px) rotate(-1deg); }
                    100% { transform: translateY(0px) translateX(0px) rotate(1deg); }
                }

                @keyframes float3 {
                    0% { transform: translateY(0px) translateX(0px) rotate(0deg); }
                    50% { transform: translateY(-9px) translateX(3px) rotate(2deg); }
                    100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
                }

                .cardsGrid {
                    display: grid;
                    grid-template-columns: repeat(5, 1fr);
                    gap: 20px;
                }

                .floatingCard {
                    width: 100%;
                    border-radius: 18px;
                    padding: 18px 18px 14px;
                    border: 2px solid rgba(0,0,0,0.12);
                    box-shadow: 0 10px 30px rgba(0,0,0,0.10);
                    backdrop-filter: blur(6px);
                    background: rgba(255,255,255,0.78);
                }

                .count {
                    font-size: clamp(28px, 5vw, 44px);
                    font-weight: 800;
                    line-height: 1;
                    letter-spacing: -0.02em;
                    margin: 6px 0 10px;
                }

                .cardLabel {
                    font-size: clamp(14px, 2vw, 18px);
                    font-weight: 800;
                    line-height: 1.2;
                }

                /* responsive breakpoints */

                @media (max-width: 1200px) {
                    .cardsGrid {
                        grid-template-columns: repeat(4, 1fr);
                    }
                }

                @media (max-width: 900px) {
                    .cardsGrid {
                        grid-template-columns: repeat(3, 1fr);
                    }
                }

                @media (max-width: 600px) {
                    .cardsGrid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }

                @media (max-width: 420px) {
                    .cardsGrid {
                        grid-template-columns: 1fr;
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    .anim1, .anim2, .anim3 {
                        animation: none !important;
                    }
                }
            `}</style>



            <div className="cardsGrid">
                {cardData.map((card) => (
                    <div
                        key={card.table}
                        className={`floatingCard ${card.className} ${kindergarten.className}`}
                        style={{
                            animation:
                                card.className === "anim1"
                                    ? "float1 6.5s ease-in-out infinite"
                                    : card.className === "anim2"
                                        ? "float2 7.8s ease-in-out infinite"
                                        : "float3 7.8s ease-in-out infinite",
                        }}
                    >
                        <div className="cardLabel">{card.label}</div>
                        <div className="count">{counts[card.table]}</div>
                    </div>
                ))}
            </div>
        </main>
    );
}
