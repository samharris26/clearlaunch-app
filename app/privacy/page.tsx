import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
    title: "Privacy Policy - ClearLaunch",
    description: "Privacy Policy and GDPR compliance information for ClearLaunch.",
};

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-slate-950 px-6 py-12 md:py-20">
            <div className="mx-auto max-w-3xl">
                <div className="mb-8">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-slate-200"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Dashboard
                    </Link>
                </div>

                <h1 className="mb-8 text-3xl font-bold tracking-tight text-slate-100 md:text-4xl">
                    Privacy Policy
                </h1>

                <div className="prose prose-invert prose-slate max-w-none">
                    <p className="lead text-lg text-slate-300">
                        Last updated: {new Date().toLocaleDateString("en-GB", { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>

                    <p>
                        At ClearLaunch ("we", "us", or "our"), we are committed to protecting
                        your personal information and your right to privacy. This Privacy
                        Policy explains how we collect, use, disclose, and safeguard your
                        information when you visit our website and use our services.
                    </p>

                    <p>
                        We are based in the United Kingdom and comply with the General Data
                        Protection Regulation (GDPR) and the Data Protection Act 2018.
                    </p>

                    <h2>1. Information We Collect</h2>
                    <p>
                        We collect personal information that you voluntarily provide to us
                        when you register on the website, express an interest in obtaining
                        information about us or our products and services, when you
                        participate in activities on the website, or otherwise when you
                        contact us.
                    </p>
                    <p>
                        The personal information that we collect depends on the context of
                        your interactions with us and the website, the choices you make, and
                        the products and features you use. The personal information we
                        collect may include the following:
                    </p>
                    <ul>
                        <li>Names</li>
                        <li>Email addresses</li>
                        <li>Billing addresses (if applicable)</li>
                        <li>Debit/credit card numbers (processed securely by our payment processors)</li>
                    </ul>

                    <h2>2. How We Use Your Information</h2>
                    <p>
                        We use personal information collected via our website for a variety
                        of business purposes described below. We process your personal
                        information for these purposes in reliance on our legitimate business
                        interests, in order to enter into or perform a contract with you,
                        with your consent, and/or for compliance with our legal obligations.
                    </p>
                    <ul>
                        <li>To facilitate account creation and logon process.</li>
                        <li>To send you marketing and promotional communications.</li>
                        <li>To send administrative information to you.</li>
                        <li>To fulfill and manage your orders.</li>
                        <li>To protect our services.</li>
                    </ul>

                    <h2>3. Cookies and Tracking Technologies</h2>
                    <p>
                        We may use cookies and similar tracking technologies (like web
                        beacons and pixels) to access or store information. Specific
                        information about how we use such technologies and how you can
                        refuse certain cookies is set out in our Cookie Notice.
                    </p>

                    <h2>4. Your Rights (GDPR)</h2>
                    <p>
                        If you are a resident of the European Economic Area (EEA) or the
                        United Kingdom (UK), you have certain rights under applicable data
                        protection laws. These may include the right:
                    </p>
                    <ul>
                        <li>To request access and obtain a copy of your personal information.</li>
                        <li>To request rectification or erasure;</li>
                        <li>To restrict the processing of your personal information;</li>
                        <li>If applicable, to data portability; and</li>
                        <li>To object to the processing of your personal information.</li>
                    </ul>
                    <p>
                        To make such a request, please use the contact details provided
                        below. We will consider and act upon any request in accordance with
                        applicable data protection laws.
                    </p>

                    <h2>5. Data Retention</h2>
                    <p>
                        We will only keep your personal information for as long as it is
                        necessary for the purposes set out in this privacy policy, unless a
                        longer retention period is required or permitted by law (such as
                        tax, accounting, or other legal requirements).
                    </p>

                    <h2>6. Contact Us</h2>
                    <p>
                        If you have questions or comments about this policy, you may email us
                        at support@clearlaunch.co.uk.
                    </p>
                </div>
            </div>
        </div>
    );
}
