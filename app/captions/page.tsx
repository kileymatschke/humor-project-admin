import { createClient } from "../../lib/supabase/server";
import { adelia } from "../fonts/fonts";
import { fors } from "../fonts/fonts";

export default async function CaptionsPage() {
    const supabase = await createClient();

    const { data: captions, error } = await supabase
        .from("captions")
        .select("id,content");

    if (error) {
        return (
            <main style={{ padding: 24 }}>
                <h1>Captions</h1>
                <pre>{JSON.stringify(error, null, 2)}</pre>
            </main>
        );
    }

    return (
        <main style={{ padding: 24 }}>
            <h1 className={adelia.className}>Captions</h1>

            <ul className={fors.className}>
                {captions?.map((caption) => (
                    <li key={caption.id}>
                        {caption.content}
                    </li>
                ))}
            </ul>
        </main>
    );
}