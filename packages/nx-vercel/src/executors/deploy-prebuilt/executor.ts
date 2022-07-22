import { exec, getExecOutput } from '@actions/exec';
import {
  Executor,
  logger,
  parseTargetString,
  readTargetOptions,
} from '@nrwl/devkit';
import { getPluginConfig } from '../../utils/plugin-config/getPluginConfig';
import { PullExecutorSchema } from '../pull/schema';
import { DeployPrebuiltExecutorSchema } from './schema';
import fs = require('fs/promises');
import path = require('path');

const runExecutor: Executor<DeployPrebuiltExecutorSchema> = async (
  options,
  context
) => {
  const { vercelCommand = 'vercel' } = getPluginConfig(context.workspace);

  const pullOptions = readTargetOptions<PullExecutorSchema>(
    parseTargetString(options.pullTarget),
    context
  );
  const projectPath = path.resolve(context.root, pullOptions.projectPath);
  const vercelDir = path.resolve(projectPath, '.vercel');

  const rootVercelDir = path.resolve(context.root, '.vercel');

  try {
    /**
     * The Vercel build command seem to rely on the .vercel folder being in the rootDirectory or at least an ancestor
     * of it, so we temporarily symlink it.
     *
     * NOTE: this means this executor cannot run in parallel on the same machine
     */
    await fs.symlink(vercelDir, rootVercelDir, 'dir');

    const buildArgs = ['build'];

    if (options.debug) {
      buildArgs.push('--debug');
    }

    await exec(vercelCommand, buildArgs, {
      cwd: context.root,
    });
  } finally {
    try {
      fs.unlink(rootVercelDir);
      logger.debug(`Removed root .vercel symlink`);
    } catch (e) {
      logger.warn('Failed to clean up root .vercel symlink');
    }
  }

  const deployArgs = ['deploy', '--prebuilt', '--cwd', projectPath];

  if (options.debug) {
    deployArgs.push('--debug');
  }

  if (options.prod) {
    deployArgs.push('--prod');
  }

  if (process.env.VERCEL_TOKEN) {
    logger.debug('Detected VERCEL_TOKEN, passing token to Vercel CLI');
    deployArgs.push('--token', process.env.VERCEL_TOKEN);
  }

  /**
   * The deploy command looks for the .git folder next to .vercel, so it can extract metadata. However even if we send
   * correct metadata their API will ignore it if Git integration is not enabled.
   */
  const { stdout: deploymentUrl } = await getExecOutput(
    vercelCommand,
    deployArgs,
    {
      cwd: context.root,
      /**
       * the output gets a bit mangled, as the stdout is inserted into the middle of the regular stderr output, so we
       * silence the stdout and log it ourselves afterwards
       */
      silent: true,
      listeners: {
        errline: (line) => logger.log(line),
      },
    }
  );

  logger.log(`Deployment: ${deploymentUrl}`);

  return {
    success: true,
  };
};

export default runExecutor;
