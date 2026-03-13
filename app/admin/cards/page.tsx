import { createClient } from "../../../lib/supabase/server";
import { redirect } from "next/navigation";
import { adelia, kindergarten } from "../fonts/fonts";

const cardData = [
    {
        label: "Users",
        table: "profiles",
        className: "anim1",
        style: { top: "20%", right: "75%", animation: "float1 6.5s ease-in-out infinite" },
    },
    {
        label: "Images",
        table: "images",
        className: "anim2",
        style: { top: "40%", right: "75%", animation: "float2 7.8s ease-in-out infinite" },
    },
    {
        label: "Allowed Signup Domains",
        table: "allowed_signup_domains",
        className: "anim3",
        style: { top: "60%", right: "75%", animation: "float3 7.8s ease-in-out infinite" },
    },
    {
        label: "Captions",
        table: "captions",
        className: "anim1",
        style: { top: "20%", right: "45%", animation: "float1 5.1s ease-in-out infinite" },
    },
    {
        label: "Humor Flavors",
        table: "humor_flavors",
        className: "anim2",
        style: { top: "20%", right: "60%", animation: "float2 7.8s ease-in-out infinite" },
    },
    {
        label: "Humor Flavor Steps",
        table: "humor_flavor_steps",
        className: "anim3",
        style: { top: "40%", right: "60%", animation: "float3 7.8s ease-in-out infinite" },
    },
    {
        label: "Humor Flavor Mix",
        table: "humor_flavor_mix",
        className: "anim1",
        style: { top: "60%", right: "60%", animation: "float1 7.8s ease-in-out infinite" },
    },
    {
        label: "Caption Requests",
        table: "caption_requests",
        className: "anim2",
        style: { top: "60%", right: "45%", animation: "float2 7.8s ease-in-out infinite" },
    },
    {
        label: "LLM Prompt Chains",
        table: "llm_prompt_chains",
        className: "anim3",
        style: { top: "60%", right: "30%", animation: "float3 7.8s ease-in-out infinite" },
    },
    {
        label: "LLM Model Responses",
        table: "llm_model_responses",
        className: "anim1",
        style: { top: "40%", right: "30%", animation: "float1 7.8s ease-in-out infinite" },
    },
    {
        label: "LLM Models",
        table: "llm_models",
        className: "anim2",
        style: { top: "20%", right: "30%", animation: "float2 7.8s ease-in-out infinite" },
    },
    {
        label: "Terms",
        table: "terms",
        className: "anim3",
        style: { top: "40%", right: "15%", animation: "float3 7.8s ease-in-out infinite" },
    },
    {
        label: "LLM Providers",
        table: "llm_providers",
        className: "anim1",
        style: { top: "20%", right: "15%", animation: "float1 7.8s ease-in-out infinite" },
    },
    {
        label: "Caption Examples",
        table: "caption_examples",
        className: "anim2",
        style: { top: "40%", right: "45%", animation: "float2 7.8s ease-in-out infinite" },
    },
    {
        label: "Whitelist Email Addresses",
        table: "whitelist_email_addresses",
        className: "anim3",
        style: { top: "60%", right: "15%", animation: "float3 7.8s ease-in-out infinite" },
    },
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
        cardData.map((card, index) => [card.table, countResults[index].count ?? 0])
    );

    return (
        <main style={{ minHeight: "100vh", position: "relative", overflow: "hidden" }}>
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

        .floatingCard {
          position: absolute;
          width: min(180px, 86vw);
          border-radius: 18px;
          padding: 18px 18px 14px;
          border: 2px solid rgba(0,0,0,0.12);
          box-shadow: 0 10px 30px rgba(0,0,0,0.10);
          backdrop-filter: blur(6px);
          background: rgba(255,255,255,0.78);
        }

        .count {
          font-size: 44px;
          font-weight: 800;
          line-height: 1;
          letter-spacing: -0.02em;
          margin: 6px 0 10px;
        }

        @media (prefers-reduced-motion: reduce) {
          .anim1, .anim2, .anim3 { animation: none !important; }
        }
      `}</style>


            {cardData.map((card) => (
                <div
                    key={card.table}
                    className={`floatingCard ${card.className} ${kindergarten.className}`}
                    style={card.style}
                >
                    <div style={{ fontSize: 18, fontWeight: 800 }}>{card.label}</div>
                    <div className="count">{counts[card.table]}</div>
                </div>
            ))}
        </main>
    );
}
