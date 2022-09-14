import { exec, ExecOptions } from '@actions/exec';
import { ExecutorContext } from '@nrwl/devkit';
import { getPackageManagerCommand } from '@nx-expand/utilities';
import path = require('path');

export async function runCdktf(
  args: string[],
  context: ExecutorContext,
  options?: Omit<ExecOptions, 'cwd'>
): Promise<{ success: boolean }> {
  const cdktfCommand = `${getPackageManagerCommand().exec} cdktf`;

  if (!context.projectName) {
    throw new Error('nx-cdktf requires projectName to be assigned');
  }

  const projectPath = path.resolve(
    context.root,
    context.workspace.projects[context.projectName].root
  );

  try {
    const returnCode = await exec(cdktfCommand, args, {
      ...options,
      cwd: projectPath,
    });
    return { success: returnCode === 0 };
  } catch (e) {
    if (process.env.NX_VERBOSE_LOGGING === 'true') {
      console.error(e);
    }

    throw new Error(
      `ERROR: Something went wrong in ${context.target?.executor} - ${
        (e as Error).message
      }`
    );
  }
}
