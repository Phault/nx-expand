import type { PostTargets } from '../../utils/post-targets';

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

  /**
   * Executor targets to run after deployment is done.
   *
   * The target overrides are enhanced with support for environment variable
   * placeholders. Use `$ENV_VAR_NAME` in any string key or value and it will be
   * replaced with the value of the environment variable.
   *
   * Extra environment variables made available:
   * - VERCEL_INSPECT_URL - Contains the inspect URL for the deployment
   * - VERCEL_DEPLOYMENT_URL - Contains the preview URL for the deployment
   */
  postTargets?: PostTargets;
}
