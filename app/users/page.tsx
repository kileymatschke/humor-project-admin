import { createClient } from "../../../lib/supabase/server";

export default async function UsersPage() {
    const supabase = await createClient();

    const { data: profiles, error } = await supabase
        .from("profiles")
        .select("id,email")
        .not("email", "is", null);

    if (error) {
        return (
            <main style={{ padding: 24 }}>
                <h1>Users</h1>
                <pre>{JSON.stringify(error, null, 2)}</pre>
            </main>
        );
    }

    return (
        <main style={{ padding: 24 }}>
            <h1>Registered Users</h1>

            <ul>
                {profiles?.map((profile) => (
                    <li key={profile.id}>{profile.email}</li>
                ))}
            </ul>
        </main>
    );
}