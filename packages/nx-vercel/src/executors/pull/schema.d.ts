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
   * The path to your project relative to the workspace root.
   * This is where the `.vercel` folder will be placed.
   *
   * @example
   * `apps/my-app`
   */
  projectPath: string;

  /**
   * If defined then the environment variables for the given {@link environment} will be written* to the specified file
   * relative to {@link projectPath}.
   *
   * \*) The file will actually be symlinked to the respective file in {@link projectPath}/.vercel.
   */
  outputEnvFile?: string;

  /**
   * Increases logging verbosity.
   * @default false
   */
  debug?: boolean;
}
