import { ExecutorContext } from '@nrwl/devkit';
import { runCdktf } from '../../utils/runCdktf';

export default async function runExecutor(
  _options: never,
  context: ExecutorContext
) {
  return runCdktf(['synth'], context);
}
