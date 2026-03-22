import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");

    const loginUrl = new URL("/login", url.origin);
    const adminUrl = new URL("/admin", url.origin);

    if (!code) {
        loginUrl.searchParams.set("error", "Login failed.");
        return NextResponse.redirect(loginUrl);
    }

    const res = NextResponse.redirect(adminUrl);

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return req.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        res.cookies.set(name, value, options);
                    });
                },
            },
        }
    );

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
        loginUrl.searchParams.set("error", "Login failed.");
        return NextResponse.redirect(loginUrl);
    }

    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
        await supabase.auth.signOut();
        loginUrl.searchParams.set("error", "Login failed.");
        return NextResponse.redirect(loginUrl);
    }

    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("is_superadmin")
        .eq("id", user.id)
        .single();

    if (profileError || !profile?.is_superadmin) {
        await supabase.auth.signOut();

        const deniedUrl = new URL("/login", url.origin);
        deniedUrl.searchParams.set(
            "error",
            "Superadmin status required to access admin area."
        );

        return NextResponse.redirect(deniedUrl);
    }

    return res;
}