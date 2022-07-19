import { NxJsonConfiguration } from '@nrwl/devkit';
import {
  setDefaults,
  validateOptsAgainstSchema,
  warnDeprecations,
  SchemaError,
} from 'nx/src/utils/params';
import { PluginConfig } from './schema';
import PluginConfigSchema = require('./schema.json');

export function getPluginConfig(nxConfig: NxJsonConfiguration) {
  const pluginConfig = (nxConfig.pluginsConfig?.['nx-vercel'] ?? {}) as Record<
    string,
    unknown
  >;
  warnDeprecations(pluginConfig, PluginConfigSchema);
  setDefaults(pluginConfig, PluginConfigSchema);

  try {
    validateOptsAgainstSchema(pluginConfig, PluginConfigSchema);
  } catch (e) {
    if (e instanceof SchemaError)
      throw new SchemaError(
        `Failed to validate plugin config for nx-vercel: ${e.message}`
      );

    throw e;
  }

  return pluginConfig as PluginConfig;
}
