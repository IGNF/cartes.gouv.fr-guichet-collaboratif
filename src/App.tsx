import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { lazy, Suspense } from "react";
import AppLayout from "./components/Layout/AppLayout";
import { BrowserRouter, Route, Routes } from "react-router";

import { HOME_URL } from "./constants/urls";
import Preload from "./components/Preload";
import LoaderComponent from "./components/LoaderComponent";

const Carte = lazy(() => import("./pages/Carte"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const persister = createAsyncStoragePersister({
    storage: window.localStorage,
});

const shouldDehydrateQuery = (query: { queryKey: readonly unknown[] }) => {
    const key = String(query.queryKey[0] ?? "");
    return !key.startsWith("GET_WFS_GET_FEATURES_");
};

export default function App() {
    return (
        <PersistQueryClientProvider client={queryClient} persistOptions={{ persister, dehydrateOptions: { shouldDehydrateQuery } }}>
            <BrowserRouter>
                <Preload />
                <ReactQueryDevtools initialIsOpen={false} />

                <AppLayout>
                    <Suspense fallback={<LoaderComponent />}>
                        <Routes>
                            <Route path={`${HOME_URL}/:communityId`} element={<Carte />} />
                            <Route path={`*`} element={<NotFound />} />
                        </Routes>
                    </Suspense>
                </AppLayout>
            </BrowserRouter>
        </PersistQueryClientProvider>
    );
}
