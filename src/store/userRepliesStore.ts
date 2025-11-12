import { Reply } from "@/constants/reports/types";
import { create } from "zustand";
interface RepliesStore {
    replies: Reply[];
    setReplies: (newReplies: Reply[]) => void;
}
export const useRepliesStore = create<RepliesStore>((set, get) => ({
    replies: [],
    setReplies: (newReplies, appendOnly = true) => {
        if (appendOnly) {
            const oldReplies = get().replies;
            const oldIds = new Set(oldReplies.map((r) => r.id));
            const filteredNewReplies = newReplies.filter((r) => !oldIds.has(r.id));
            set({ replies: [...oldReplies, ...filteredNewReplies] });
        } else {
            set({ replies: newReplies });
        }
    },
}));
