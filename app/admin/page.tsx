import { createClient } from "../../lib/supabase/server";

export default async function AdminPage() {
    const supabase = await createClient();  // ✅ await here
    const { data } = await supabase.auth.getUser();

    const email = data.user?.email ?? "(no user)";

    return (
        <main style={{ padding: 24 }}>
            <h1>Admin</h1>
            <p>Signed in as: {email}</p>
            <p>This is gated content ✅</p>
        </main>
    );
}