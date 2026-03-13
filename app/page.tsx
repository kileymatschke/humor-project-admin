import { createClient } from "../lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import SignOutButton from "./admin/components/SignOutButton";
import { adelia } from "./admin/fonts/fonts";
import { kindergarten } from "./admin/fonts/fonts";


export default async function Home() {
    const supabase = await createClient();

    // 🔐 check if user is logged in
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const [{ count: userCount }, { count: imageCount }, { count: captionCount }, { count: flavorCount },
        { count: flavorStepsCount }, { count: captionRequestsCount }, { count: LLMPromptChainsCount},
        { count: LLMModelResponsesCount }, { count: termsCount }] =
        await Promise.all([
            supabase
                .from("profiles")
                .select("*", { count: "exact", head: true }),
            supabase.from("images").select("*", { count: "exact", head: true }),
            supabase.from("captions").select("*", { count: "exact", head: true }),
            supabase.from("humor_flavors").select("*", { count: "exact", head: true }),
            supabase.from("humor_flavor_steps").select("*", { count: "exact", head: true }),
            supabase.from("caption_requests").select("*", { count: "exact", head: true }),
            supabase.from("llm_prompt_chains").select("*", { count: "exact", head: true }),
            supabase.from("llm_model_responses").select("*", { count: "exact", head: true }),
            supabase.from("terms").select("*", { count: "exact", head: true }),
        ]);

    return (
        <main
            style={{
                minHeight: "100vh",
                padding: 24,
                position: "relative",
                overflow: "hidden",
            }}
        >
            {/* CSS animations (scoped to this page) */}
            <style>{`
        @keyframes float1 {
          0%   { transform: translateY(0px) translateX(0px) rotate(-1deg); }
          50%  { transform: translateY(-18px) translateX(18px) rotate(1deg); }
          100% { transform: translateY(0px) translateX(0px) rotate(-1deg); }
        }
        @keyframes float2 {
          0%   { transform: translateY(0px) translateX(0px) rotate(1deg); }
          50%  { transform: translateY(-26px) translateX(-12px) rotate(-1deg); }
          100% { transform: translateY(0px) translateX(0px) rotate(1deg); }
        }
        @keyframes float3 {
          0%   { transform: translateY(0px) translateX(0px) rotate(0deg); }
          50%  { transform: translateY(-20px) translateX(14px) rotate(2deg); }
          100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
        }

        .floatingCard {
          position: absolute;
          width: min(210px, 86vw);
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

        .cta a {
          display: inline-block;
          margin-top: 8px;
          padding: 10px 12px;
          border-radius: 12px;
          border: 1px solid rgba(0,0,0,0.18);
          text-decoration: none;
          transition: transform 120ms ease, box-shadow 120ms ease;
        }
        .cta a:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 18px rgba(0,0,0,0.12);
        }

        /* Respect reduced motion preferences */
        @media (prefers-reduced-motion: reduce) {
          .anim1, .anim2, .anim3 { animation: none !important; }
        }
      `}</style>

            {/* Header area (kept normal/non-floating so it's easy to use) */}
            <div style={{ position: "relative", zIndex: 2 }}>
                <h1 className={adelia.className} style={{ margin: 0 }}>
                    Dashboard
                </h1>
                <div style={{ marginTop: 12, marginBottom: 6 }}>
                    <SignOutButton />
                </div>
            </div>

            {/* Floating stage */}
            <div style={{ position: "relative", zIndex: 1, height: "calc(100vh - 120px)" }}>
                {/* Users card */}
                <div
                    className={`floatingCard anim1 ${kindergarten.className}`}
                    style={{
                        top: "52%",
                        left: "8%",
                        animation: "float1 6.5s ease-in-out infinite",
                    }}
                >
                    <div style={{ fontSize: 18, fontWeight: 800 }}>Users</div>
                    <div className="count">{userCount ?? 0}</div>
                    <div className="cta" style={{ fontSize: 16, fontWeight: 700 }}>
                        <Link
                            href="/admin/users"
                            style={{
                                color: "black",
                                textDecoration: "none"
                            }}
                        >
                            View profiles
                        </Link>
                    </div>
                </div>

                {/* Images card */}
                <div
                    className={`floatingCard anim2 ${kindergarten.className}`}
                    style={{
                        top: "39%",
                        right: "13%",
                        animation: "float2 7.8s ease-in-out infinite",
                    }}
                >
                    <div style={{ fontSize: 18, fontWeight: 800 }}>Images</div>
                    <div className="count">{imageCount ?? 0}</div>
                    <div className="cta" style={{ fontSize: 16, fontWeight: 700 }}>
                        <Link
                            href="/admin/images"
                            style={{
                                color: "black",
                                textDecoration: "none"
                            }}
                        >
                            View images
                        </Link>
                    </div>
                </div>

                {/* Captions card */}
                <div
                    className={`floatingCard anim3 ${kindergarten.className}`}
                    style={{
                        bottom: "75%",
                        left: "28%",
                        animation: "float3 5.1s ease-in-out infinite",
                    }}
                >
                    <div style={{ fontSize: 18, fontWeight: 800 }}>Captions</div>
                    <div className="count">{captionCount ?? 0}</div>
                    <div className="cta" style={{ fontSize: 16, fontWeight: 700 }}>
                        <Link
                            href="/admin/captions"
                            style={{
                                color: "black",
                                textDecoration: "none"
                            }}
                        >
                            View captions
                        </Link>
                    </div>
                </div>



                {/* Humor flavors card */}
                <div
                    className={`floatingCard anim1 ${kindergarten.className}`}
                    style={{
                        top: "60%",
                        right: "32%",
                        animation: "float3 7.8s ease-in-out infinite",
                    }}
                >
                    <div style={{ fontSize: 18, fontWeight: 800 }}>Humor flavors</div>
                    <div className="count">{flavorCount ?? 0}</div>
                    <div className="cta" style={{ fontSize: 16, fontWeight: 700 }}>
                        <Link
                            href="/admin/flavors"
                            style={{
                                color: "black",
                                textDecoration: "none"
                            }}
                        >
                            View humor flavors
                        </Link>
                    </div>
                </div>




                {/* Humor flavor steps card */}
                <div
                    className={`floatingCard anim2 ${kindergarten.className}`}
                    style={{
                        top: "20%",
                        right: "78%",
                        animation: "float2 7.8s ease-in-out infinite",
                    }}
                >
                    <div style={{ fontSize: 18, fontWeight: 800 }}>Humor flavor steps</div>
                    <div className="count">{flavorStepsCount ?? 0}</div>
                    <div className="cta" style={{ fontSize: 16, fontWeight: 700 }}>
                        <Link
                            href="/admin/flavor_steps"
                            style={{
                                color: "black",
                                textDecoration: "none"
                            }}
                        >
                            View humor flavor steps
                        </Link>
                    </div>
                </div>




                {/* Caption requests card */}
                <div
                    className={`floatingCard anim2 ${kindergarten.className}`}
                    style={{
                        top: "35%",
                        right: "55%",
                        animation: "float1 7.8s ease-in-out infinite",
                    }}
                >
                    <div style={{ fontSize: 18, fontWeight: 800 }}>Caption requests</div>
                    <div className="count">{captionRequestsCount ?? 0}</div>
                    <div className="cta" style={{ fontSize: 16, fontWeight: 700 }}>
                        <Link
                            href="/admin/caption_requests"
                            style={{
                                color: "black",
                                textDecoration: "none"
                            }}
                        >
                            View caption requests
                        </Link>
                    </div>
                </div>




                {/* LLM prompt chains card */}
                <div
                    className={`floatingCard anim2 ${kindergarten.className}`}
                    style={{
                        top: "10%",
                        right: "35%",
                        animation: "float3 7.8s ease-in-out infinite",
                    }}
                >
                    <div style={{ fontSize: 18, fontWeight: 800 }}>LLM Prompt Chains</div>
                    <div className="count">{LLMPromptChainsCount ?? 0}</div>
                    <div className="cta" style={{ fontSize: 16, fontWeight: 700 }}>
                        <Link
                            href="/admin/llm_prompt_chains"
                            style={{
                                color: "black",
                                textDecoration: "none"
                            }}
                        >
                            View LLM prompt chains
                        </Link>
                    </div>
                </div>



                {/* LLM model responses card */}
                <div
                    className={`floatingCard anim2 ${kindergarten.className}`}
                    style={{
                        top: "1%",
                        right: "8%",
                        animation: "float2 7.8s ease-in-out infinite",
                    }}
                >
                    <div style={{ fontSize: 18, fontWeight: 800 }}>LLM Model Responses</div>
                    <div className="count">{LLMModelResponsesCount ?? 0}</div>
                    <div className="cta" style={{ fontSize: 16, fontWeight: 700 }}>
                        <Link
                            href="/admin/llm_model_responses"
                            style={{
                                color: "black",
                                textDecoration: "none"
                            }}
                        >
                            View LLM responses
                        </Link>
                    </div>
                </div>





                {/* Terms card */}
                <div
                    className={`floatingCard anim2 ${kindergarten.className}`}
                    style={{
                        top: "70%",
                        right: "8%",
                        animation: "float1 7.8s ease-in-out infinite",
                    }}
                >
                    <div style={{ fontSize: 18, fontWeight: 800 }}>Terms</div>
                    <div className="count">{termsCount ?? 0}</div>
                    <div className="cta" style={{ fontSize: 16, fontWeight: 700 }}>
                        <Link
                            href="/admin/terms"
                            style={{
                                color: "black",
                                textDecoration: "none"
                            }}
                        >
                            View terms
                        </Link>
                    </div>
                </div>





            </div>
        </main>
    );
}