import { createClient } from "../../../lib/supabase/server";
import { adelia, kindergarten, fors } from "../fonts/fonts";
import Link from "next/link";

type Profile = {
    id: string;
    email: string | null;
    first_name: string | null;
    last_name: string | null;
    created_datetime_utc: string | null;
    modified_datetime_utc: string | null;
    is_superadmin: boolean | null;
    is_in_study: boolean | null;
    is_matrix_admin: boolean | null;
};

export default async function UsersPage() {
    const supabase = await createClient();

    const { data: profiles, error } = await supabase
        .from("profiles")
        .select(`
            id,
            email,
            first_name,
            last_name,
            created_datetime_utc,
            modified_datetime_utc,
            is_superadmin,
            is_in_study,
            is_matrix_admin
        `)
        .order("last_name", { ascending: true })
        .order("first_name", { ascending: true });

    if (error) {
        return (
            <main style={{ padding: 24 }}>
                <h1>Users</h1>
                <pre>{JSON.stringify(error, null, 2)}</pre>
            </main>
        );
    }

    const safeProfiles: Profile[] = profiles ?? [];

    return (
        <main style={{ padding: 24, minHeight: "100vh" }}>
            <h1 className={adelia.className}>Users</h1>

            {/*<div*/}
            {/*    className={kindergarten.className}*/}
            {/*    style={{ marginTop: 6, marginBottom: 18, fontSize: 16, fontWeight: 700 }}*/}
            {/*>*/}
            {/*    <Link href="/" style={{ textDecoration: "none", color: "black" }}>*/}
            {/*        ← Back to dashboard*/}
            {/*    </Link>*/}
            {/*</div>*/}

            {/*<div*/}
            {/*    className={kindergarten.className}*/}
            {/*    style={{*/}
            {/*        fontSize: "20px",*/}
            {/*        fontWeight: "bold",*/}
            {/*        marginTop: 16,*/}
            {/*        marginBottom: 16,*/}
            {/*    }}*/}
            {/*>*/}
            {/*    Total: {safeProfiles.length}*/}
            {/*</div>*/}

            <div style={{ overflowX: "auto" }}>
                <table
                    style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        backgroundColor: "white",
                        border: "1px solid #ccc",
                    }}
                >
                    <thead>
                    <tr style={{ backgroundColor: "#f5f5f5" }}>
                        <th className={fors.className} style={thStyle}>ID</th>
                        <th className={fors.className} style={thStyle}>Email</th>
                        <th className={fors.className} style={thStyle}>First Name</th>
                        <th className={fors.className} style={thStyle}>Last Name</th>
                        <th className={fors.className} style={thStyle}>Created (UTC)</th>
                        <th className={fors.className} style={thStyle}>Modified (UTC)</th>
                        <th className={fors.className} style={thStyle}>Super Admin</th>
                        <th className={fors.className} style={thStyle}>In Study</th>
                        <th className={fors.className} style={thStyle}>Matrix Admin</th>
                    </tr>
                    </thead>

                    <tbody>
                    {safeProfiles.map((profile) => (
                        <tr key={profile.id}>
                            <td style={tdStyle} className={fors.className}>{profile.id}</td>
                            <td style={tdStyle} className={fors.className}>{profile.email ?? "—"}</td>
                            <td style={tdStyle} className={fors.className}>{profile.first_name ?? "—"}</td>
                            <td style={tdStyle} className={fors.className}>{profile.last_name ?? "—"}</td>
                            <td style={tdStyle} className={fors.className}>{profile.created_datetime_utc ?? "—"}</td>
                            <td style={tdStyle} className={fors.className}>{profile.modified_datetime_utc ?? "—"}</td>
                            <td style={tdStyle} className={fors.className}>{profile.is_superadmin ? "✓" : ""}</td>
                            <td style={tdStyle} className={fors.className}>{profile.is_in_study ? "✓" : ""}</td>
                            <td style={tdStyle} className={fors.className}>{profile.is_matrix_admin ? "✓" : ""}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </main>
    );
}

const thStyle = {
    textAlign: "left" as const,
    padding: "12px",
    borderBottom: "1px solid #ccc",
};

const tdStyle = {
    padding: "12px",
    borderBottom: "1px solid #eee",
    verticalAlign: "top" as const,
};




// import { createClient } from "../../../lib/supabase/server";
// import { adelia } from "../fonts/fonts";
// import { kindergarten } from "../fonts/fonts";
// import { fors } from "../fonts/fonts";
// import Link from "next/link";
//
//
// type Profile = {
//     id: string;
//     email: string | null;
//     first_name: string | null;
//     last_name: string | null;
// };
//
// export default async function UsersPage() {
//     const supabase = await createClient();
//
//     const { data: profiles, error } = await supabase
//         .from("profiles")
//         .select("id,email,first_name,last_name")
//         .not("email", "is", null);
//
//     if (error) {
//         return (
//             <main style={{ padding: 24 }}>
//                 <h1>Emails</h1>
//                 <pre>{JSON.stringify(error, null, 2)}</pre>
//             </main>
//         );
//     }
//
//
//     const safeProfiles: Profile[] = (profiles ?? []).filter(
//         (profile): profile is Profile => !!profile.email
//     );
//
//     const getDomain = (email: string) => {
//         const parts = email.split("@");
//         return parts.length > 1 ? `@${parts[1].toLowerCase()}` : "@unknown";
//     };
//
//     const domains = Array.from(
//         new Set(safeProfiles.map((profile) => getDomain(profile.email!)))
//     ).sort();
//
//     const palette = [
//         "#d5f29b", // soft green
//         "#bb9bf2", // soft purple
//         "#cde5f7", // soft blue barnard
//         "#f2df9b", // yellow
//         "#f2a19b", // red
//         "#f29bb7", // pink
//         "#9bccf2", // blue columbia
//         "#f2ee9b", // lime
//         "#db9bf2", // fuschia
//         "#f29be2", // pink
//         "#f29b9c", // salmon
//         "#9bf2d2", // aqua
//
//         "#e5cdf7",
//         "#f7e7cd",
//         "#f7cddf",
//         "#cdf3f7",
//         "#cdf7d6",
//         "#cdd3f7",
//         "#f7f3cd",
//         "#eaf7cd",
//         "#f7cdf3",
//         "#cde1f7",
//         "#ebfffe",
//         "#ffebfb",
//         "#bd79af",
//         "#bcbd79",
//         "#79bda5",
//     ];
//
//     const domainColorMap = new Map<string, string>();
//     domains.forEach((domain, index) => {
//         domainColorMap.set(domain, palette[index % palette.length]);
//     });
//
//     return (
//         <main style={{ padding: 24, minHeight: "100vh" }}>
//             <style>{`
//                 @keyframes floatA {
//                     0% { transform: translateY(0px) rotate(-1deg); }
//                     50% { transform: translateY(-8px) rotate(1deg); }
//                     100% { transform: translateY(0px) rotate(-1deg); }
//                 }
//
//                 @keyframes floatB {
//                     0% { transform: translateY(0px) rotate(1deg); }
//                     50% { transform: translateY(-10px) rotate(-1deg); }
//                     100% { transform: translateY(0px) rotate(1deg); }
//                 }
//
//                 @keyframes floatC {
//                     0% { transform: translateY(0px) rotate(0deg); }
//                     50% { transform: translateY(-6px) rotate(1deg); }
//                     100% { transform: translateY(0px) rotate(0deg); }
//                 }
//
//                 .legendWrap {
//                     display: flex;
//                     flex-wrap: wrap;
//                     gap: 12px;
//                     margin-top: 18px;
//                     margin-bottom: 28px;
//                 }
//
//                 .legendItem {
//                     display: flex;
//                     align-items: center;
//                     gap: 8px;
//                     padding: 8px 12px;
//                     border-radius: 999px;
//                     border: 1px solid rgba(0,0,0,0.12);
//                     background: rgba(255,255,255,0.8);
//                 }
//
//                 .legendSwatch {
//                     width: 16px;
//                     height: 16px;
//                     border-radius: 999px;
//                     border: 1px solid rgba(0,0,0,0.15);
//                     flex-shrink: 0;
//                 }
//
//                 .emailsWrap {
//                     display: flex;
//                     flex-wrap: wrap;
//                     gap: 18px;
//                     align-items: flex-start;
//                 }
//
//                 .emailCard {
//                     min-width: 220px;
//                     max-width: 320px;
//                     padding: 14px 16px;
//                     border-radius: 18px;
//                     border: 1px solid rgba(0,0,0,0.12);
//                     box-shadow: 0 8px 20px rgba(0,0,0,0.10);
//                     word-break: break-word;
//                 }
//
//                 .floatA {
//                     animation: floatA 4.8s ease-in-out infinite;
//                 }
//
//                 .floatB {
//                     animation: floatB 5.6s ease-in-out infinite;
//                 }
//
//                 .floatC {
//                     animation: floatC 4.2s ease-in-out infinite;
//                 }
//
//                 @media (prefers-reduced-motion: reduce) {
//                     .floatA, .floatB, .floatC {
//                         animation: none !important;
//                     }
//                 }
//             `}</style>
//
//             <h1 className={adelia.className}>User Emails</h1>
//
//             <div
//                 className={kindergarten.className}
//                 style={{ marginTop: 6, fontSize: 16, fontWeight: 700 }}
//             >
//                 <Link href="/" style={{ textDecoration: "none", color: "black" }}>
//                     ← Back to dashboard
//                 </Link>
//             </div>
//
//             {/*<div*/}
//             {/*    className={kindergarten.className}*/}
//             {/*    style={{ fontSize: "20px", fontWeight: "bold", marginTop: 8 }}*/}
//             {/*>*/}
//             {/*    Total: {safeProfiles.length}*/}
//             {/*</div>*/}
//
//             <div style={{ marginTop: 24, marginBottom: 10 }}>
//                 <h2
//                     className={kindergarten.className}
//                     style={{ fontSize: "20px", fontWeight: "bold", margin: 0 }}
//                 >
//                     Color Legend (Based on Email Domain)
//                 </h2>
//             </div>
//
//             <div className="legendWrap">
//                 {domains.map((domain) => (
//                     <div key={domain} className={`legendItem ${fors.className}`}>
//                         <span
//                             className="legendSwatch"
//                             style={{ backgroundColor: domainColorMap.get(domain)}}
//                         />
//                         <span style={{ fontSize: "12px" }}>{domain}</span>
//                     </div>
//                 ))}
//             </div>
//
//             <div className="emailsWrap">
//                 {safeProfiles.map((profile, index) => {
//                     const domain = getDomain(profile.email!);
//                     const bgColor = domainColorMap.get(domain) ?? "#FFFFFF";
//                     const floatClass =
//                         index % 3 === 0 ? "floatA" : index % 3 === 1 ? "floatB" : "floatC";
//
//                     return (
//                         <div
//                             key={profile.id}
//                             className={`emailCard ${floatClass} ${kindergarten.className}`}
//                             style={{ backgroundColor: bgColor }}
//                         >
//                             {profile.email}
//                         </div>
//                     );
//                 })}
//             </div>
//         </main>
//     );
// }