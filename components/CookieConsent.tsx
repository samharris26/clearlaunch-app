"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function CookieConsent() {
    const [isVisible, setIsVisible] = React.useState(false);
    const pathname = usePathname();

    React.useEffect(() => {
        // Don't show cookie banner in the Next.js app
        // Users come from clearlaunch.co.uk marketing site which handles its own cookie consent
        // This includes login, sign-up, and all authenticated app routes
        if (!pathname) {
            return; // Wait for pathname to be available
        }

        // Hide cookie banner on all routes - marketing site handles consent
        setIsVisible(false);
    }, [pathname]);

    const handleAccept = () => {
        localStorage.setItem("cookie-consent", "accepted");
        setIsVisible(false);
    };

    const handleDecline = () => {
        localStorage.setItem("cookie-consent", "declined");
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-800 bg-slate-950/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-slate-950/60 md:p-6">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 md:flex-row">
                <div className="text-center md:text-left">
                    <p className="text-sm leading-relaxed text-slate-300">
                        We use cookies to enhance your experience and analyze our traffic. By
                        clicking "Accept", you consent to our use of cookies. See our{" "}
                        <a
                            href="/privacy"
                            className="font-medium text-indigo-400 hover:text-indigo-300 hover:underline"
                        >
                            Privacy Policy
                        </a>
                        .
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDecline}
                        className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-slate-100"
                    >
                        Decline
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleAccept}
                        className="bg-indigo-600 text-white hover:bg-indigo-500"
                    >
                        Accept
                    </Button>
                </div>
            </div>
        </div>
    );
}
