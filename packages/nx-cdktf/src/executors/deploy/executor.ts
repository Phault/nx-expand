import { ExecutorContext } from '@nrwl/devkit';
import { runCdktf } from '../../utils/runCdktf';
import { DeployExecutorSchema } from './schema';

export default async function runExecutor(
  options: DeployExecutorSchema,
  context: ExecutorContext
) {
  const args = ['deploy'];

  if (options.autoApprove) {
    args.push('--auto-approve');
  }

  if (options.ignoreMissingStackDependencies) {
    args.push('--ignore-missing-stack-dependencies');
  }

  if (options.outputsFile) {
    args.push('--outputs-file', options.outputsFile);
  }

  if (options.outputsFileIncludeSensitiveOutputs) {
    args.push('--outputs-file-include-sensitive-outputs');
  }

  if (options.parallelism) {
    args.push('--parallelism', options.parallelism.toString());
  }

  if (options.stacks?.length) {
    args.push(...options.stacks);
  }

  return runCdktf(args, context);
}
