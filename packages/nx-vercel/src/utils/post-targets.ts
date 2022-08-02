import {
  ExecutorContext,
  logger,
  parseTargetString,
  readTargetOptions,
  runExecutor,
  Target,
  targetToTargetString,
} from '@nrwl/devkit';
import type { JsonObject } from 'type-fest';
import { substituteEnvVarsInObject } from '@nx-expand/utilities';

export type TargetString = string;

export type TargetWithOptions = {
  target: Target | TargetString;
  overrides?: JsonObject;
};

export type PostTargets = (Target | TargetString | TargetWithOptions)[];

export async function runPostTargets(
  targets: PostTargets,
  context: ExecutorContext
) {
  const postTargets = normalizePostTargets(targets);

  for (const postTarget of postTargets) {
    const targetString = targetToTargetString(postTarget.target);

    logger.info(`Running post-target "${targetString}".`);
    try {
      await runPostTarget(postTarget, context);
    } catch (error) {
      if (error instanceof Error) {
        logger.error(
          `An error occured while running post-target "${targetString}": ${error.stack}}`
        );
      }
      throw error;
    }
  }
}

async function runPostTarget(
  postTarget: NormalizedTargetWithOptions,
  context: ExecutorContext
) {
  const targetOptions = readTargetOptions<JsonObject>(
    postTarget.target,
    context
  );

  const overrides = substituteEnvVarsInObject({
    ...targetOptions,
    ...postTarget.overrides,
  });

  for await (const { success } of await runExecutor(
    postTarget.target,
    overrides,
    context
  )) {
    if (!success) {
      const targetString = targetToTargetString(postTarget.target);

      throw new Error(
        `Something went wrong with post-target "${targetString}".`
      );
    }
  }
}

type NormalizedTargetWithOptions = TargetWithOptions & { target: Target };

export function normalizePostTargets(
  targets: (string | Target | TargetWithOptions)[]
): NormalizedTargetWithOptions[] {
  return targets.map((target) => {
    if (typeof target === 'string') {
      return { target: parseTargetString(target) };
    }

    if ('project' in target) {
      return {
        target,
      };
    }

    return {
      ...target,
      target:
        typeof target.target === 'string'
          ? parseTargetString(target.target)
          : target.target,
    };
  });
}
