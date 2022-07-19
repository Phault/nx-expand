export interface DeployPrebuiltExecutorSchema {
  /**
   * The output path of the build task.
   *
   * @example
   * dist/apps/myapp
   */
  buildPath: string;

  /**
   * The target `nx-vercel:pull` task that pulled the project settings.
   *
   * @example
   * my-app:pull:preview
   */
  pullTarget: string;

  /**
   * Whether to create a production deployment (true), or preview deployment (false).
   *
   * @default false
   */
  prod?: boolean;

  /**
   * Increases logging verbosity.
   * @default false
   */
  debug?: boolean;
}
