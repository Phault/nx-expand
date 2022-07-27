export interface DeployPrebuiltExecutorSchema {
  /**
   * The output path of the build task.
   *
   * @example
   * dist/apps/myapp
   */
  buildPath: string;

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
