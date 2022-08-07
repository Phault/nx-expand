import { NxJsonConfiguration } from '@nrwl/devkit';
import PluginConfigSchema = require('./plugin-config-schema.json');
import { getPluginConfig as getPluginConfigOriginal } from '@nx-expand/utilities';

export type PluginConfig = {
  baseUrl: string;
  projectKey: string;
  repositorySlug: string;
};

export const getPluginConfig = (nxConfig: NxJsonConfiguration) =>
  getPluginConfigOriginal<PluginConfig>(
    nxConfig,
    'nx-bitbucket-server',
    PluginConfigSchema
  );
