import { useEffect } from "react";
import { useContributionStore } from "@/store/useContributionStore";

export function useBeforeUnload() {
    const contributions = useContributionStore((s) => s.contributions);

    useEffect(() => {
        if (contributions.length === 0) return;

        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            event.preventDefault();
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [contributions.length]);
}
