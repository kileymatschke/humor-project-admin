"use client";
import { createClient } from "../../../lib/supabase/browser";
import { adelia } from "../fonts/fonts";

export default function SignOutButton() {
    const supabase = createClient();

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        window.location.href = "/login";
    };

    return (
        <button
            onClick={handleSignOut}
            className={adelia.className}
            style={{
                marginTop: 20,
                padding: "8px 16px",
                borderRadius: 6,
                border: "1px solid #FFBE1A",
                cursor: "pointer",
                background: "#FFF8E5",
                color: "#F4AF00"
            }}
        >
            Sign Out
        </button>
    );
}