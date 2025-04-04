import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import AppLayout from "./components/Layout/AppLayout";
import { BrowserRouter, Route, Routes } from "react-router";

import Home from "./pages/Home";
import Carte from "./pages/Carte";
import About from "./pages/About";
import NotFound from "./pages/NotFound";

import { ABOUT_URL, CARTE_URL, HOME_URL } from "./constants/urls";

const queryClient = new QueryClient();

const persister = createSyncStoragePersister({
    storage: window.localStorage,
});

export default function App() {
    return (
        <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
            <BrowserRouter>
                <ReactQueryDevtools initialIsOpen={false} />

                <AppLayout>
                    <Routes>
                        <Route path={HOME_URL} element={<Home />} />
                        <Route path={CARTE_URL} element={<Carte />} />
                        <Route path={ABOUT_URL} element={<About />} />
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </AppLayout>
            </BrowserRouter>
        </PersistQueryClientProvider>
    );
}
