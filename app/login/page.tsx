"use client";

import { useSearchParams } from "next/navigation";
import { createClient } from "../../lib/supabase/browser";
import { adelia } from "../admin/fonts/fonts";
import { kindergarten } from "../admin/fonts/fonts";

export default function LoginPage() {
    const supabase = createClient();
    const searchParams = useSearchParams();

    const errorMessage = searchParams.get("error");

    async function signInWithGoogle() {
        const origin = window.location.origin;

        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${origin}/auth/callback`,
            },
        });

        if (error) alert(error.message);
    }

    return (
        <main
            style={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                gap: "20px",
            }}
        >
            <h1 style={{ fontSize: "40px" }} className={adelia.className}>
                Sign in
            </h1>

            {/* ✅ ERROR MESSAGE */}
            {errorMessage && (
                <p
                    style={{
                        color: "#DE89BE",
                        fontSize: "24px",
                        textAlign: "center",
                        maxWidth: "500px",
                        fontWeight: "bold",
                        margin: 0,
                    }}
                    className={kindergarten.className}
                >
                    {decodeURIComponent(errorMessage)}
                </p>
            )}

            <button
                onClick={signInWithGoogle}
                style={{ fontSize: "20px", fontWeight: "bold" }}
                className={kindergarten.className}
            >
                Sign in with Google
            </button>
        </main>
    );
}