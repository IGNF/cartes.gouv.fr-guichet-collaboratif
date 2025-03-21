import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";

import GuichetCollaboratifApp from "./GuichetCollaboratif";

const queryClient = new QueryClient();

const persister = createSyncStoragePersister({
    storage: window.localStorage,
});

export default function App() {
    return (
        <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
            <ReactQueryDevtools initialIsOpen={false} />

            <GuichetCollaboratifApp />
        </PersistQueryClientProvider>
    );
}
