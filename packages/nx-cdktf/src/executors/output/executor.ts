import { ExecutorContext } from '@nrwl/devkit';
import { runCdktf } from '../../utils/runCdktf';
import { OutputExecutorSchema } from './schema';

export default async function runExecutor(
  options: OutputExecutorSchema,
  context: ExecutorContext
) {
  const args = ['output'];

  if (options.outputsFile) {
    args.push('--outputs-file', options.outputsFile);
  }

  if (options.outputsFileIncludeSensitiveOutputs) {
    args.push('--outputs-file-include-sensitive-outputs');
  }

  return runCdktf(args, context);
}
