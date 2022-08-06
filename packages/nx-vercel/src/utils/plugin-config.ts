import { NxJsonConfiguration } from '@nrwl/devkit';
import PluginConfigSchema = require('./plugin-config.json');
import { getPluginConfig as getPluginConfigOriginal } from '@nx-expand/utilities';

export interface PluginConfig {
  /**
   * Override the command for Vercel CLI, e.g. to use the locally installed package or proxify-vercel.
   * @default "vercel"
   */
  vercelCommand?: string;
}

export const getPluginConfig = (nxConfig: NxJsonConfiguration) =>
  getPluginConfigOriginal<PluginConfig>(
    nxConfig,
    'nx-vercel',
    PluginConfigSchema
  );
