import { useQuery, useQueryClient } from "@tanstack/react-query";
// @ts-expect-error il manque les types
import Gp from "geoportal-access-lib";

export default function useGpConfig() {
    const queryKey = ["GP_SERVICE_CONFIG"];
    const queryClient = useQueryClient();
    const cached = queryClient.getQueryData(queryKey);
    return useQuery({
        queryKey: queryKey,
        queryFn: () => {
            return new Gp.Services.Config({
                customConfigFile: "https://raw.githubusercontent.com/IGNF/geoportal-configuration/new-url/dist/fullConfig.json",
                onSuccess: () => {},
                onFailure: () => {},
            });
        },
        staleTime: Infinity,
        enabled: !cached,
    });
}
