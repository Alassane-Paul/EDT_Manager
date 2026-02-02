import { useQuery } from "@tanstack/react-query";
import { periodesApi } from "@/api/periodes/api";

export function usePeriodes() {
    const query = useQuery({
        queryKey: ["periodes"],
        queryFn: periodesApi.getAll
    });

    return {
        periodes: query.data?.periodes ?? [],
        isLoading: query.isLoading,
        error: query.error,
        refetch: query.refetch,
    };
}
