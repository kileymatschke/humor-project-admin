import { createClient } from "../lib/supabase/server";
import Link from "next/link";
import SignOutButton from "./admin/components/SignOutButton";
import { adelia } from "./admin/fonts/fonts";
import { kindergarten } from "./admin/fonts/fonts";

export default async function Home() {
    const supabase = await createClient();

    const [{ count: userCount }, { count: imageCount }, { count: captionCount }] =
        await Promise.all([
            supabase
                .from("profiles")
                .select("*", { count: "exact", head: true }),
                // .not("email", "is", null),
            supabase.from("images").select("*", { count: "exact", head: true }),
            supabase.from("captions").select("*", { count: "exact", head: true }),
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
          width: min(340px, 86vw);
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
                            View emails
                        </Link>
                    </div>
                </div>

                {/* Images card */}
                <div
                    className={`floatingCard anim2 ${kindergarten.className}`}
                    style={{
                        top: "29%",
                        right: "9%",
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
            </div>
        </main>
    );
}