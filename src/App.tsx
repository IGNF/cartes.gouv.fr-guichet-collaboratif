import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import AppLayout from "./components/Layout/AppLayout";
import { BrowserRouter, Route, Routes } from "react-router";

import NotFound from "./pages/NotFound";
import Carte from "./pages/Carte";
import { HOME_URL } from "./constants/urls";
import Preload from "./components/Preload";

const queryClient = new QueryClient();

const persister = createAsyncStoragePersister({
    storage: window.localStorage,
});

export default function App() {
    return (
        <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
            <BrowserRouter>
                <Preload />
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
