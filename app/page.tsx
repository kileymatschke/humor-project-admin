import { createClient } from "../../lib/supabase/server";
import Link from "next/link";
import SignOutButton from "../components/SignOutButton";
import { adelia } from "../fonts/fonts";
import { kindergarten } from "../fonts/fonts";


export default async function HomePage() {
    const supabase = await createClient();

    // Who is logged in (this ALWAYS has your email if signed in)
    const { data: authData } = await supabase.auth.getUser();
    const myAuthEmail = authData.user?.email ?? "(no auth email)";


    return (
        <main style={{ padding: 24 }}>
            <h1 className={adelia.className}>Home</h1>
            <div style={{marginBottom:30}}><SignOutButton /></div>
            {/*<p>Signed in as (from auth): {myAuthEmail}</p>*/}

            <div className={kindergarten.className} style={{ fontSize: "20px", fontWeight: "bold" }}><Link href="../users">View all registered users</Link></div>
            <div className={kindergarten.className} style={{ fontSize: "20px", fontWeight: "bold" }}><Link href="../images">View all images</Link></div>
            <div className={kindergarten.className} style={{ fontSize: "20px", fontWeight: "bold" }}><Link href="../captions">View all captions</Link></div>

        </main>
    );
}