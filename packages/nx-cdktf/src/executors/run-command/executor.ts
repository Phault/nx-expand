import { ExecutorContext } from '@nrwl/devkit';
import { runCdktf } from '../../utils/runCdktf';
import { RunCommandExecutorSchema } from './schema';

export default async function runExecutor(
  options: RunCommandExecutorSchema,
  context: ExecutorContext
) {
  return runCdktf(options.__unparsed__, context);
}
