import { ExecutorContext } from '@nrwl/devkit';
import { runCdktf } from '../../utils/runCdktf';
import { DestroyExecutorSchema } from './schema';

export default async function runExecutor(
  options: DestroyExecutorSchema,
  context: ExecutorContext
) {
  const args = ['destroy'];

  if (options.autoApprove) {
    args.push('--auto-approve');
  }

  if (options.ignoreMissingStackDependencies) {
    args.push('--ignore-missing-stack-dependencies');
  }

  if (options.parallelism) {
    args.push('--parallelism', options.parallelism.toString());
  }

  if (options.stacks?.length) {
    args.push(...options.stacks);
  }

  return runCdktf(args, context);
}
