import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import AppLayout from "./components/Layout/AppLayout";
import { BrowserRouter, Route, Routes } from "react-router";
import { deflate, inflate } from "pako";

import NotFound from "./pages/NotFound";
import Carte from "./pages/Carte";
import { HOME_URL } from "./constants/urls";

const queryClient = new QueryClient();

const persister = createSyncStoragePersister({
    storage: window.localStorage,
    serialize: (data) => {
        const json = JSON.stringify(data);
        const binary = deflate(json);
        return btoa(String.fromCharCode(...binary));
    },
    deserialize: (base64) => {
        try {
            const binaryString = atob(base64);
            const bytes = Uint8Array.from(binaryString, (char) => char.charCodeAt(0));
            const json = inflate(bytes, { to: "string" });
            return JSON.parse(json);
        } catch (err) {
            console.warn("Failed to decompress persisted cache:", err);
            return undefined;
        }
    },
});

export default function App() {
    return (
        <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
            <BrowserRouter>
                <ReactQueryDevtools initialIsOpen={false} />

                <AppLayout>
                    <Routes>
                        <Route path={`${HOME_URL}/:communityId`} element={<Carte />} />
                        <Route path={`*`} element={<NotFound />} />
                    </Routes>
                </AppLayout>
            </BrowserRouter>
        </PersistQueryClientProvider>
    );
}
