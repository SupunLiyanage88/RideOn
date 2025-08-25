import { DefaultOptions, QueryClient } from "@tanstack/react-query";

const defaultOptions: DefaultOptions = {
  queries: {
    staleTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 0,
    networkMode: "online",
  },
  mutations: {
    networkMode: "offlineFirst",
  },
};

const queryClient = new QueryClient({ defaultOptions });

export default queryClient;
