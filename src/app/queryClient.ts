import { QueryClient } from '@tanstack/react-query';

// Centralized defaults so individual hooks don't have to repeat the same
// staleTime/retry policy. Hooks can still override per-query when they
// genuinely need different behavior (e.g. shorter staleTime for reviews).
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

export default queryClient;
