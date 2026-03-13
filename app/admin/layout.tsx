import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) redirect("/login");

    const { data: profile } = await supabase
        .from("profiles")
        .select("is_superadmin")
        .eq("id", auth.user.id)
        .single();

    if (!profile?.is_superadmin) redirect("/");

    return <>{children}</>;
}

