import { CustomHasher, Task, HasherContext } from '@nrwl/devkit';
import { getPluginConfig } from '../../utils/plugin-config/getPluginConfig';

const mimicNxHasher: CustomHasher = async (
  task: Task,
  context: HasherContext
) => {
  const { pullCacheLifetimeSec = 120 } = getPluginConfig(
    context.workspaceConfig
  );
  const baseHash = await context.hasher.hashTaskWithDepsAndContext(task);
  const roundedDate = Math.floor(
    Date.now() / (pullCacheLifetimeSec * 1000)
  ).toString();

  return {
    ...baseHash,
    value: context.hasher.hashArray([baseHash.value, roundedDate]),
  };
};

export default mimicNxHasher;
