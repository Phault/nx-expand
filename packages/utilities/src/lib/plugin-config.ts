import {
  ExecutorContext,
  joinPathFragments,
  NxJsonConfiguration,
  readJsonFile,
} from '@nrwl/devkit';
import {
  setDefaults,
  validateOptsAgainstSchema,
  warnDeprecations,
  SchemaError,
  Schema,
} from 'nx/src/utils/params';

export function getPluginConfig<T>(
  context: ExecutorContext,
  pluginName: string,
  schema: Schema
): T {
  const nxConfig = readJsonFile<NxJsonConfiguration>(
    joinPathFragments(context.root, 'nx.json')
  );
  const pluginConfig = (nxConfig.pluginsConfig?.[pluginName] ?? {}) as Record<
    string,
    unknown
  >;
  warnDeprecations(pluginConfig, schema);
  setDefaults(pluginConfig, schema);

  try {
    validateOptsAgainstSchema(pluginConfig, schema);
  } catch (e) {
    if (e instanceof SchemaError)
      throw new SchemaError(
        `Failed to validate plugin config for ${pluginName}: ${e.message}`
      );

    throw e;
  }

  return pluginConfig as T;
}
