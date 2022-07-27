export interface PullExecutorSchema {
  /**
   * Can be found in your project settings on Vercel.
   */
  projectId: string;

  /**
   * Also known as "user ID" or "team ID".
   *
   * Can be found in your user/team settings on Vercel.
   */
  orgId: string;

  /**
   * The environment to pull variables for.
   *
   * @default "development"
   */
  environment: 'development' | 'preview' | 'production';

  /**
   * If defined then the environment variables for the given {@link environment} will be written to the specified file
   * relative to {@link projectPath}.
   */
  outputEnvFile?: string;

  /**
   * Increases logging verbosity.
   * @default false
   */
  debug?: boolean;
}
