import { z } from 'zod';
import { publicProcedure, router } from '../trpc';

export const appRouter = router({
  healthCheck: publicProcedure
    .query(() => {
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
      };
    }),
    
  getClusterMetrics: publicProcedure
    .query(() => {
      // In production, this would query Prometheus or Flink REST APIs
      return {
        cpuUsage: 45.2,
        memoryUsage: 60.1,
        activeNodes: 12,
      };
    }),
});

export type AppRouter = typeof appRouter;
