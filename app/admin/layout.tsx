import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient();

    const { data: auth, error: authError } = await supabase.auth.getUser();

    if (authError || !auth.user) {
        redirect("/login");
    }

    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("is_superadmin")
        .eq("id", auth.user.id)
        .single();

    // 🚨 KEY CHANGE: sign them out before redirecting
    if (profileError || !profile?.is_superadmin) {
        await supabase.auth.signOut();

        redirect("/login?error=Superadmin%20status%20required%20for%20login.");
    }

    return <>{children}</>;
}