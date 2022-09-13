import { exec } from '@actions/exec';
import { ExecutorContext, getPackageManagerCommand } from '@nrwl/devkit';
import path = require('path');
import { CdktfExecutorSchema } from './schema';

export default async function runExecutor(
  options: CdktfExecutorSchema,
  context: ExecutorContext
) {
  const cdktfCommand = `${getPackageManagerCommand().exec} cdktf`;

  if (!context.projectName) {
    throw new Error('nx-terraform requires projectName to be assigned');
  }

  const projectPath = path.resolve(
    context.root,
    context.workspace.projects[context.projectName].root
  );

  try {
    const returnCode = await exec(cdktfCommand, options.__unparsed__, {
      cwd: projectPath,
    });
    return { success: returnCode === 0 };
  } catch (e) {
    if (process.env.NX_VERBOSE_LOGGING === 'true') {
      console.error(e);
    }

    throw new Error(
      `ERROR: Something went wrong in nx-terraform:cdktf - ${
        (e as Error).message
      }`
    );
  }
}