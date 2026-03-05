import { createClient } from "../../lib/supabase/server";
import { adelia } from "../fonts/fonts";
import { kindergarten } from "../fonts/fonts";
import { fors } from "../fonts/fonts";

export default async function UsersPage() {
    const supabase = await createClient();

    const { data: profiles, error } = await supabase
        .from("profiles")
        .select("id,email,first_name,last_name")
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
            <h1 className={adelia.className}>Registered Users</h1>

            <ul className={fors.className}>
                {profiles?.map((profile) => (
                    <li key={profile.id}>
                        {profile.first_name} {profile.last_name} — {profile.email}
                    </li>
                ))}
            </ul>
        </main>
    );
}