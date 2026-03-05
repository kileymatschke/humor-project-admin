import { supabase } from "../lib/supabase";


export default async function Home() {
    const { data, error, count } = await supabase
        .from("profiles")
        .select("*", { count: "exact" })
        .limit(10);

    if (error) {
        return <pre>{JSON.stringify(error, null, 2)}</pre>
    }

    return (
        <main>
            <h1>Emails from profiles</h1>

            <ul>
                {data?.map((row, i) => (
                    <li key={i}>{row.email}</li>
                ))}
            </ul>
        </main>
    );
}