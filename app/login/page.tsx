"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "../../lib/supabase/browser";
import { adelia } from "../admin/fonts/fonts";
import { kindergarten } from "../admin/fonts/fonts";

function LoginContent() {
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
                color: "#F4AF00"
            }}
        >
            <h1 style={{ fontSize: "30px" }} className={adelia.className}>
                The Humor Project:<br /> Admin Dashboard
            </h1>

            {errorMessage && (
                <p
                    style={{
                        color: "#C0678C",
                        fontSize: "20px",
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
                className={kindergarten.className}
                style={{
                    marginTop: 2,
                    padding: "8px 16px",
                    borderRadius: 6,
                    border: "1px solid #FFBE1A",
                    cursor: "pointer",
                    background: "#FFF8E5",
                    color: "#F4AF00",
                    fontSize: "24px",
                    fontWeight: "bold"
                }}
            >
                Sign in with Google
            </button>
        </main>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={null}>
            <LoginContent />
        </Suspense>
    );
}