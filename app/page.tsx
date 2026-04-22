export const dynamic = "force-dynamic";

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
    { label: "Overview", value: "all" },
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
          color: #C0678C;
          font-weight: 700;
          margin-bottom: 8px;
          border: 1px solid rgba(192,103,140,0.08);
          background: rgba(192,103,140,0.08);
          transition: background 120ms ease, border 120ms ease, transform 120ms ease;
        }

        .sidebar-link:hover {
          transform: translateY(-2px);
          background: rgba(192,103,140,0.14);
        }

        .sidebar-link.active {
          color: #899B24;
          background: #F7F9ED;
          border: 1px solid #F7F9ED;
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

                <p className={fors.className} style={{ fontSize: 14, fontWeight: 1000, marginTop: 42, color: "#83932D" }}>
                    THE HUMOR PROJECT:
                </p>

                <h1 className={adelia.className} style={{ marginBottom: 12, color: "#83932D" }}>
                    Admin Dashboard
                </h1>

                <div style={{ marginBottom: 28 }}>
                    <SignOutButton />
                </div>

                <nav className={adelia.className}>
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