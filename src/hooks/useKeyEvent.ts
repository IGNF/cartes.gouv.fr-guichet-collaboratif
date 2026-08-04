import { useEffect } from "react";

//Hook to handle key events
export default function useKeyEvent(event: "keydown" | "keyup", handler: (e: KeyboardEvent) => void, enabled = true) {
    useEffect(() => {
        if (!enabled) return;
        document.addEventListener(event, handler);
        return () => document.removeEventListener(event, handler);
    }, [event, handler, enabled]);
}
