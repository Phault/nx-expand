import {
  Executor,
  ExecutorContext,
  logger,
  parseTargetString,
  readTargetOptions,
  runExecutor,
  Target,
  targetToTargetString,
} from '@nrwl/devkit';
import type { JsonObject } from 'type-fest';
import { renderObject } from '@nx-expand/utilities';
import { assign, mapValues } from 'lodash';

export type TargetString = string;

export type TargetWithOptions = {
  target: Target | TargetString;
  overrides?: JsonObject;
};

export type PostTargets = (Target | TargetString | TargetWithOptions)[];

export async function runPostTargets(
  targets: PostTargets,
  context: ExecutorContext,
  result: ExecutorResult
) {
  // load the extra env vars
  assign(
    process.env,
    mapValues(result.env, (value) => value?.toString())
  );

  const variables = {
    ...result,
    env: process.env,

    // cop-out with the type coercion, but failing to see how to do it right 🤷‍♂️
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    context: context as unknown as JsonObject,
  };

  const postTargets = normalizePostTargets(targets);

  for (const postTarget of postTargets) {
    const targetString = targetToTargetString(postTarget.target);

    logger.info(`Running post-target "${targetString}".`);
    try {
      await runPostTarget(postTarget, context, variables);
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
  context: ExecutorContext,
  variables: JsonObject = {}
) {
  const targetOptions = readTargetOptions<JsonObject>(
    postTarget.target,
    context
  );

  const overrides = renderObject(
    {
      ...targetOptions,
      ...postTarget.overrides,
    },
    variables,
    undefined,
    {
      escape: (text) => text,
    }
  );

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

export type ExecutorResult = {
  success: boolean;
  metadata?: JsonObject;
  env?: { [key: string]: string | number | boolean | null | undefined };
};

async function unwrapExecutorIterator(
  input: AsyncIterableIterator<ExecutorResult>
): Promise<ExecutorResult> {
  let lastResult = { success: false };

  for await (const result of input) {
    lastResult = result;

    if (!result.success) break;
  }

  return lastResult;
}

export type PostTargetsOptions = {
  /**
   * Executor targets to run after this task has completed or failed.
   *
   * The target overrides are enhanced with support for environment variable
   * placeholders. Use `$ENV_VAR_NAME` in any string key or value and it will be
   * replaced with the value of the environment variable.
   */
  postTargets?: {
    onSuccess?: PostTargets;
    onFailure?: PostTargets;
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ExecutorWithPostTargets<Options extends PostTargetsOptions = any> =
  (
    options: Options,
    context: ExecutorContext
  ) => Promise<ExecutorResult> | AsyncIterableIterator<ExecutorResult>;

export function withPostTargets<Options extends PostTargetsOptions>(
  executor: ExecutorWithPostTargets<Options>
): Executor<Options> {
  return async (options, context) => {
    let result: ExecutorResult | undefined;

    try {
      const promiseOrIterable = executor(options, context);
      result =
        'then' in promiseOrIterable
          ? await promiseOrIterable
          : await unwrapExecutorIterator(promiseOrIterable);
    } catch (e) {
      // unexpected error, so no metadata is prepared for us
      // TODO: make some error metadata available, maybe in a separate HOC
      await runPostTargets(options.postTargets?.onFailure ?? [], context, {
        success: false,
      });
      throw e;
    }

    if (result.success) {
      await runPostTargets(
        options.postTargets?.onSuccess ?? [],
        context,
        result
      );
    } else {
      await runPostTargets(
        options.postTargets?.onFailure ?? [],
        context,
        result
      );
    }

    return result;
  };
}
