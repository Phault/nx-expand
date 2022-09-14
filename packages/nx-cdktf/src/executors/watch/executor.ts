import { ExecutorContext } from '@nrwl/devkit';
import { runCdktf } from '../../utils/runCdktf';
import { WatchExecutorSchema } from './schema';

export default async function runExecutor(
  options: WatchExecutorSchema,
  context: ExecutorContext
) {
  const args = ['watch'];

  if (options.autoApprove) {
    args.push('--auto-approve');
  }

  if (options.parallelism) {
    args.push('--parallelism', options.parallelism.toString());
  }

  if (options.stacks?.length) {
    args.push(...options.stacks);
  }

  return runCdktf(args, context);
}
