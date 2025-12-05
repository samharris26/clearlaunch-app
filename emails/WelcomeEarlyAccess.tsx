import * as React from "react";

type WelcomeEarlyAccessProps = {
    email: string;
};

export function WelcomeEarlyAccess({ email }: WelcomeEarlyAccessProps) {
    return (
        <div
            style={{
                fontFamily:
                    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'",
                backgroundColor: "#f9fafb",
                padding: "40px 20px",
                color: "#111827",
                lineHeight: "1.5",
            }}
        >
            <div
                style={{
                    maxWidth: "560px",
                    margin: "0 auto",
                    backgroundColor: "#ffffff",
                    borderRadius: "12px",
                    overflow: "hidden",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                }}
            >
                {/* Header with Gradient */}
                <div
                    style={{
                        height: "6px",
                        background: "linear-gradient(to right, #6366f1, #0ea5e9, #34d399)",
                    }}
                />

                <div style={{ padding: "32px 32px 40px" }}>
                    {/* Logo / Brand */}
                    <div style={{ marginBottom: "24px", display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "18px", fontWeight: "700", color: "#0f172a", letterSpacing: "-0.025em" }}>ClearLaunch</span>
                    </div>

                    <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#111827", margin: "0 0 24px", letterSpacing: "-0.025em" }}>
                        You’re in <span style={{ verticalAlign: "middle" }}>🚀</span>
                    </h1>

                    <p style={{ fontSize: "16px", color: "#374151", margin: "0 0 24px", lineHeight: "1.6" }}>
                        Hey{email ? ` ${email}` : ""}, thanks for joining the ClearLaunch early access list.
                    </p>

                    <p style={{ fontSize: "16px", color: "#374151", margin: "0 0 16px", lineHeight: "1.6" }}>
                        Here’s what you can expect:
                    </p>

                    <ul style={{ margin: "0 0 24px 0", padding: "0 0 0 24px", color: "#374151", fontSize: "16px", lineHeight: "1.6" }}>
                        <li style={{ marginBottom: "8px" }}>Progress updates as we ship new features</li>
                        <li style={{ marginBottom: "8px" }}>Invites for early testing and feedback</li>
                        <li style={{ marginBottom: "8px" }}>First look at launch templates + the AI task engine</li>
                    </ul>

                    <div style={{ backgroundColor: "#f3f4f6", borderRadius: "8px", padding: "20px", margin: "0 0 24px" }}>
                        <p style={{ fontSize: "16px", color: "#374151", margin: "0", lineHeight: "1.6" }}>
                            <strong>Want to get ahead?</strong> Just reply and tell me what you’re planning to launch – SaaS, ecommerce, course, or something else. It helps us prioritise what to build next.
                        </p>
                    </div>

                    <p style={{ fontSize: "16px", color: "#374151", margin: "0", lineHeight: "1.6" }}>
                        Speak soon,<br />
                        <strong>Sam</strong> @ ClearLaunch
                    </p>
                </div>

                {/* Footer */}
                <div style={{ padding: "20px 32px", backgroundColor: "#f9fafb", borderTop: "1px solid #e5e7eb", fontSize: "12px", color: "#6b7280", textAlign: "center" }}>
                    <p style={{ margin: 0 }}>
                        © {new Date().getFullYear()} ClearLaunch. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
}
