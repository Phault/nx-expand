export interface PluginConfig {
  /**
   * Override the command for Vercel CLI, e.g. to use the locally installed
   * package or proxify-vercel.
   * @default "vercel"
   */
  vercelCommand?: string;

  /**
   * The `pull` executor is not that suitable for caching, but to avoid making
   * the same requests in quick succession, and for the sake of working with
   * Distributed Task Execution, we cache the result for X amount of seconds as
   * specified by this option.
   *
   * Note: This is technically the maximum lifetime.
   *
   * @default 120
   */
  pullCacheLifetimeSec?: number;
}
