export interface PluginConfig {
  /**
   * Override the command for Vercel CLI, e.g. to use the locally installed package or proxify-vercel.
   * @default "vercel"
   */
  vercelCommand?: string;
}
