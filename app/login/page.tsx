"use client";

import { createClient } from "../../lib/supabase/browser";

export default function LoginPage() {
    const supabase = createClient();

    async function signInWithGoogle() {
        const origin = window.location.origin;

        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${origin}/auth/callback`, // EXACT
            },
        });

        if (error) alert(error.message);
    }

    return (
        <main style={{ padding: 24 }}>
            <h1>Login</h1>
            <button onClick={signInWithGoogle}>Sign in with Google</button>
        </main>
    );
}