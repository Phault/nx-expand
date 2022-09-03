import { ExecutorContext } from '@nrwl/devkit';
import PluginConfigSchema = require('./plugin-config-schema.json');
import { getPluginConfig as getPluginConfigOriginal } from '@nx-expand/utilities';

export type PluginConfig = {
  baseUrl: string;
  projectKey: string;
  repositorySlug: string;
};

export const getPluginConfig = (context: ExecutorContext) =>
  getPluginConfigOriginal<PluginConfig>(
    context,
    'nx-bitbucket-server',
    PluginConfigSchema
  );
