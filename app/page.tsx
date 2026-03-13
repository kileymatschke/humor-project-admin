import { createClient } from "../lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import SignOutButton from "./admin/components/SignOutButton";
import { adelia, fors, kindergarten } from "./admin/fonts/fonts";

import CardsPage from "./admin/cards/page";
import UsersPage from "./admin/users/page";
import ImagesPage from "./admin/images/page";
import HumorFlavorsPage from "./admin/flavors/page";
import TermsPage from "./admin/terms/page";
import CaptionsPage from "./admin/captions/page";
import LLMModelsPage from "./admin/llm_models/page";
import AllowedSignupDomainsPage from "./admin/allowed_signup_domains/page";
import WhitelistEmailAddressesPage from "./admin/whitelist_email_addresses/page";
import HumorFlavorStepsPage from "./admin/flavor_steps/page";
import HumorFlavorMixPage from "./admin/humor_flavor_mix/page";
import CaptionRequestsPage from "./admin/caption_requests/page";
import CaptionExamplesPage from "./admin/caption_examples/page";
import LlmProvidersPage from "./admin/llm_providers/page";
import LlmPromptChainsPage from "./admin/llm_prompt_chains/page";
import LlmModelResponsesPage from "./admin/llm_model_responses/page";

type Section =
    | "all"
    | "users"
    | "images"
    | "humor-flavor-steps"
    | "humor-flavor-mix"
    | "humor-flavors"
    | "terms"
    | "captions"
    | "caption-requests"
    | "caption-examples"
    | "llm-providers"
    | "llm-prompt-chains"
    | "llm-models"
    | "llm-model-responses"
    | "allowed-signup-domains"
    | "whitelist-email-addresses";

type DashboardSearchParams = {
    section?: string;
    page?: string;
    lookup?: string;
};

type SectionPageProps = {
    searchParams?: Promise<DashboardSearchParams>;
};

const navItems: { label: string; value: Section }[] = [
    { label: "All", value: "all" },
    { label: "Users", value: "users" },
    { label: "Images", value: "images" },
    { label: "Humor Flavors", value: "humor-flavors" },
    { label: "Humor Flavor Steps", value: "humor-flavor-steps" },
    { label: "Humor Flavor Mix", value: "humor-flavor-mix" },
    { label: "Captions", value: "captions" },
    { label: "Caption Examples", value: "caption-examples" },
    { label: "Caption Requests", value: "caption-requests" },
    { label: "LLM Models", value: "llm-models" },
    { label: "LLM Model Responses", value: "llm-model-responses" },
    { label: "LLM Prompt Chains", value: "llm-prompt-chains" },
    { label: "LLM Providers", value: "llm-providers" },
    { label: "Terms", value: "terms" },
    { label: "Allowed Signup Domains", value: "allowed-signup-domains" },
    { label: "Whitelist Email Addresses", value: "whitelist-email-addresses" },
];

const sectionComponents: Record<
    Section,
    React.ComponentType<SectionPageProps>
> = {
    all: CardsPage,
    users: UsersPage,
    images: ImagesPage,
    "humor-flavor-steps": HumorFlavorStepsPage,
    "humor-flavor-mix": HumorFlavorMixPage,
    "humor-flavors": HumorFlavorsPage,
    terms: TermsPage,
    captions: CaptionsPage,
    "caption-requests": CaptionRequestsPage,
    "caption-examples": CaptionExamplesPage,
    "llm-providers": LlmProvidersPage,
    "llm-prompt-chains": LlmPromptChainsPage,
    "llm-models": LLMModelsPage,
    "llm-model-responses": LlmModelResponsesPage,
    "allowed-signup-domains": AllowedSignupDomainsPage,
    "whitelist-email-addresses": WhitelistEmailAddressesPage,
};

export default async function Home({
                                       searchParams,
                                   }: {
    searchParams?: Promise<DashboardSearchParams>;
}) {
    const resolvedSearchParams = (await searchParams) ?? {};

    const rawSection = resolvedSearchParams.section;
    const currentSection: Section =
        rawSection && rawSection in sectionComponents
            ? (rawSection as Section)
            : navItems[0].value;

    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const SectionComponent = sectionComponents[currentSection];

    return (
        <main
            style={{
                minHeight: "100vh",
                display: "flex",
                overflow: "hidden",
            }}
        >
            <style>{`
        .sidebar-link {
          display: block;
          padding: 12px 14px;
          border-radius: 12px;
          text-decoration: none;
          color: black;
          font-weight: 700;
          margin-bottom: 8px;
          border: 1px solid rgba(0,0,0,0.08);
          background: rgba(255,255,255,0.7);
          transition: background 120ms ease, border 120ms ease, transform 120ms ease;
        }

        .sidebar-link:hover {
          transform: translateY(-1px);
          background: rgba(255,255,255,0.95);
        }

        .sidebar-link.active {
          background: rgba(0,0,0,0.08);
          border: 1px solid rgba(0,0,0,0.18);
        }
      `}</style>

            <aside
                style={{
                    width: 260,
                    minHeight: "100vh",
                    padding: 24,
                    borderRight: "1px solid rgba(0,0,0,0.1)",
                    background: "rgba(255,255,255,0.75)",
                    position: "relative",
                    zIndex: 3,
                    overflowY: "auto",
                }}
            >
                <h1 className={adelia.className} style={{ marginTop: 42, marginBottom: 12 }}>
                    Dashboard
                </h1>

                <div style={{ marginBottom: 20 }}>
                    <SignOutButton />
                </div>

                <nav className={fors.className}>
                    {navItems.map((item) => (
                        <Link
                            key={item.value}
                            href={`/?section=${item.value}`}
                            className={`sidebar-link ${
                                currentSection === item.value ? "active" : ""
                            }`}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>
            </aside>

            <section
                style={{
                    flex: 1,
                    minHeight: "100vh",
                    padding: 24,
                    overflowY: "auto",
                }}
            >
                <SectionComponent
                    searchParams={Promise.resolve(resolvedSearchParams)}
                />
            </section>
        </main>
    );
}




//
//
// import { createClient } from "../lib/supabase/server";
// import { redirect } from "next/navigation";
// import Link from "next/link";
// import SignOutButton from "./admin/components/SignOutButton";
// import { adelia, kindergarten } from "./admin/fonts/fonts";
//
// type Section =
//     | "all"
//     | "users"
//     | "images"
//     | "humor-flavors"
//     | "terms"
//     | "captions"
//     | "llm"
//     | "allowed-signup-domains"
//     | "whitelist-email-addresses";
//
// const navItems: { label: string; value: Section }[] = [
//     { label: "All", value: "all" },
//     { label: "Users", value: "users" },
//     { label: "Images", value: "images" },
//     { label: "Humor Flavors", value: "humor-flavors" },
//     { label: "Terms", value: "terms" },
//     { label: "Captions", value: "captions" },
//     { label: "LLM", value: "llm" },
//     { label: "Allowed Signup Domains", value: "allowed-signup-domains" },
//     { label: "Whitelist E-mail Addresses", value: "whitelist-email-addresses" },
// ];
//
// const cardData = [
//     {
//         label: "Users",
//         table: "profiles",
//         href: "/admin/users",
//         section: "users" as Section,
//         className: "anim1",
//         style: {
//             top: "52%",
//             left: "8%",
//             animation: "float1 6.5s ease-in-out infinite",
//         },
//     },
//     {
//         label: "Images",
//         table: "images",
//         href: "/admin/images",
//         section: "images" as Section,
//         className: "anim2",
//         style: {
//             top: "39%",
//             right: "13%",
//             animation: "float2 7.8s ease-in-out infinite",
//         },
//     },
//     {
//         label: "Captions",
//         table: "captions",
//         href: "/admin/captions",
//         section: "captions" as Section,
//         className: "anim3",
//         style: {
//             bottom: "90%",
//             left: "28%",
//             animation: "float3 5.1s ease-in-out infinite",
//         },
//     },
//     {
//         label: "Humor flavors",
//         table: "humor_flavors",
//         href: "/admin/flavors",
//         section: "humor-flavors" as Section,
//         className: "anim1",
//         style: {
//             top: "64%",
//             right: "28%",
//             animation: "float3 7.8s ease-in-out infinite",
//         },
//     },
//     {
//         label: "Humor flavor steps",
//         table: "humor_flavor_steps",
//         href: "/admin/flavor_steps",
//         section: "humor-flavors" as Section,
//         className: "anim2",
//         style: {
//             top: "20%",
//             right: "85%",
//             animation: "float2 7.8s ease-in-out infinite",
//         },
//     },
//     {
//         label: "Caption requests",
//         table: "caption_requests",
//         href: "/admin/caption_requests",
//         section: "captions" as Section,
//         className: "anim2",
//         style: {
//             top: "35%",
//             right: "55%",
//             animation: "float1 7.8s ease-in-out infinite",
//         },
//     },
//     {
//         label: "LLM Prompt Chains",
//         table: "llm_prompt_chains",
//         href: "/admin/llm_prompt_chains",
//         section: "llm" as Section,
//         className: "anim2",
//         style: {
//             bottom: "76%",
//             right: "40%",
//             animation: "float3 7.8s ease-in-out infinite",
//         },
//     },
//     {
//         label: "LLM Model Responses",
//         table: "llm_model_responses",
//         href: "/admin/llm_model_responses",
//         section: "llm" as Section,
//         className: "anim2",
//         style: {
//             bottom: "84%",
//             right: "8%",
//             animation: "float2 7.8s ease-in-out infinite",
//         },
//     },
//     {
//         label: "Terms",
//         table: "terms",
//         href: "/admin/terms",
//         section: "terms" as Section,
//         className: "anim2",
//         style: {
//             top: "70%",
//             right: "8%",
//             animation: "float1 7.8s ease-in-out infinite",
//         },
//     },
//     {
//         label: "Caption Examples",
//         table: "caption_examples",
//         href: "/admin/caption_examples",
//         section: "captions" as Section,
//         className: "anim2",
//         style: {
//             top: "66%",
//             right: "58%",
//             animation: "float2 7.8s ease-in-out infinite",
//         },
//     },
//     {
//         label: "LLM Models",
//         table: "llm_models",
//         href: "/admin/llm_models",
//         section: "llm" as Section,
//         className: "anim2",
//         style: {
//             top: "10%",
//             right: "24%",
//             animation: "float3 7.8s ease-in-out infinite",
//         },
//     },
//     {
//         label: "LLM Providers",
//         table: "llm_providers",
//         href: "/admin/llm_providers",
//         section: "llm" as Section,
//         className: "anim2",
//         style: {
//             top: "26%",
//             right: "70%",
//             animation: "float1 7.8s ease-in-out infinite",
//         },
//     },
//     {
//         label: "Allowed Signup Domains",
//         table: "allowed_signup_domains",
//         href: "/admin/allowed_signup_domains",
//         section: "allowed-signup-domains" as Section,
//         className: "anim2",
//         style: {
//             top: "34%",
//             right: "35%",
//             animation: "float1 7.8s ease-in-out infinite",
//         },
//     },
//     {
//         label: "Whitelist Email Addresses",
//         table: "whitelist_email_addresses",
//         href: "/admin/whitelist_email_addresses",
//         section: "whitelist-email-addresses" as Section,
//         className: "anim2",
//         style: {
//             top: "70%",
//             right: "42%",
//             animation: "float2 7.8s ease-in-out infinite",
//         },
//     },
//     {
//         label: "Humor Flavor Mix",
//         table: "humor_flavor_mix",
//         href: "/admin/humor_flavor_mix",
//         section: "humor-flavors" as Section,
//         className: "anim2",
//         style: {
//             top: "70%",
//             right: "42%",
//             animation: "float3 7.8s ease-in-out infinite",
//         },
//     },
// ];
//
// export default async function Home({
//                                        searchParams,
//                                    }: {
//     searchParams?: Promise<{ section?: string }>;
// }) {
//     const resolvedSearchParams = await searchParams;
//     const currentSection = (resolvedSearchParams?.section as Section) || "all";
//
//     const supabase = await createClient();
//
//     const {
//         data: { user },
//     } = await supabase.auth.getUser();
//
//     if (!user) {
//         redirect("/login");
//     }
//
//     const countResults = await Promise.all(
//         cardData.map(({ table }) =>
//             supabase.from(table).select("*", { count: "exact", head: true })
//         )
//     );
//
//     const counts = Object.fromEntries(
//         cardData.map((card, index) => [card.table, countResults[index].count ?? 0])
//     );
//
//     const visibleCards =
//         currentSection === "all"
//             ? cardData
//             : cardData.filter((card) => card.section === currentSection);
//
//     return (
//         <main
//             style={{
//                 minHeight: "100vh",
//                 display: "flex",
//                 overflow: "hidden",
//             }}
//         >
//             <style>{`
//         @keyframes float1 {
//           0%   { transform: translateY(0px) translateX(0px) rotate(-1deg); }
//           50%  { transform: translateY(-18px) translateX(18px) rotate(1deg); }
//           100% { transform: translateY(0px) translateX(0px) rotate(-1deg); }
//         }
//         @keyframes float2 {
//           0%   { transform: translateY(0px) translateX(0px) rotate(1deg); }
//           50%  { transform: translateY(-26px) translateX(-12px) rotate(-1deg); }
//           100% { transform: translateY(0px) translateX(0px) rotate(1deg); }
//         }
//         @keyframes float3 {
//           0%   { transform: translateY(0px) translateX(0px) rotate(0deg); }
//           50%  { transform: translateY(-20px) translateX(14px) rotate(2deg); }
//           100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
//         }
//
//         .floatingCard {
//           position: absolute;
//           width: min(180px, 86vw);
//           border-radius: 18px;
//           padding: 18px 18px 14px;
//           border: 2px solid rgba(0,0,0,0.12);
//           box-shadow: 0 10px 30px rgba(0,0,0,0.10);
//           backdrop-filter: blur(6px);
//           background: rgba(255,255,255,0.78);
//         }
//
//         .count {
//           font-size: 44px;
//           font-weight: 800;
//           line-height: 1;
//           letter-spacing: -0.02em;
//           margin: 6px 0 10px;
//         }
//
//         .cta a {
//           display: inline-block;
//           margin-top: 8px;
//           padding: 10px 12px;
//           border-radius: 12px;
//           border: 1px solid rgba(0,0,0,0.18);
//           text-decoration: none;
//           transition: transform 120ms ease, box-shadow 120ms ease;
//           color: black;
//         }
//
//         .cta a:hover {
//           transform: translateY(-1px);
//           box-shadow: 0 8px 18px rgba(0,0,0,0.12);
//         }
//
//         .sidebar-link {
//           display: block;
//           padding: 12px 14px;
//           border-radius: 12px;
//           text-decoration: none;
//           color: black;
//           font-weight: 700;
//           margin-bottom: 8px;
//           border: 1px solid rgba(0,0,0,0.08);
//           background: rgba(255,255,255,0.7);
//         }
//
//         .sidebar-link.active {
//           background: rgba(0,0,0,0.08);
//           border: 1px solid rgba(0,0,0,0.18);
//         }
//
//         @media (prefers-reduced-motion: reduce) {
//           .anim1, .anim2, .anim3 { animation: none !important; }
//         }
//       `}</style>
//
//             <aside
//                 style={{
//                     width: 260,
//                     minHeight: "100vh",
//                     padding: 24,
//                     borderRight: "1px solid rgba(0,0,0,0.1)",
//                     background: "rgba(255,255,255,0.75)",
//                     position: "relative",
//                     zIndex: 3,
//                     overflowY: "auto",
//                 }}
//             >
//                 <h1 className={adelia.className} style={{ marginTop: 0, marginBottom: 18 }}>
//                     Dashboard
//                 </h1>
//
//                 <div style={{ marginBottom: 20 }}>
//                     <SignOutButton />
//                 </div>
//
//                 <nav className={kindergarten.className}>
//                     {navItems.map((item) => (
//                         <Link
//                             key={item.value}
//                             href={`/?section=${item.value}`}
//                             className={`sidebar-link ${
//                                 currentSection === item.value ? "active" : ""
//                             }`}
//                         >
//                             {item.label}
//                         </Link>
//                     ))}
//                 </nav>
//             </aside>
//
//             <section
//                 style={{
//                     flex: 1,
//                     position: "relative",
//                     minHeight: "100vh",
//                     padding: 24,
//                     overflow: "hidden",
//                 }}
//             >
//                 <div
//                     style={{
//                         position: "relative",
//                         zIndex: 1,
//                         height: "calc(100vh - 48px)",
//                     }}
//                 >
//                     {visibleCards.map((card) => (
//                         <div
//                             key={card.table}
//                             className={`floatingCard ${card.className} ${kindergarten.className}`}
//                             style={card.style}
//                         >
//                             <div style={{ fontSize: 18, fontWeight: 800 }}>{card.label}</div>
//                             <div className="count">{counts[card.table]}</div>
//                             <div className="cta" style={{ fontSize: 16, fontWeight: 700 }}>
//                                 <Link href={card.href}>View</Link>
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             </section>
//         </main>
//     );
// }
