import { Executor, logger } from '@nrwl/devkit';
import { exec } from '@actions/exec';
import { getPluginConfig } from '../../utils/plugin-config/getPluginConfig';
import { PullExecutorSchema } from './schema';
import path = require('path');
import fs = require('fs/promises');
import { fileExists } from 'nx/src/utils/fileutils';
import { linkVercelProject } from '../../utils/linkVercelProject';

async function ensureDotEnvSymlink(
  resolvedProjectPath: string,
  options: PullExecutorSchema
) {
  if (!options.outputEnvFile) {
    throw new Error(
      `Can't create symlink for environment file, since outputEnvFile is not defined.`
    );
  }

  const downloadedEnvFile = path.resolve(
    resolvedProjectPath,
    `.vercel/.env.${options.environment}.local`
  );
  const outputEnvFile = path.resolve(
    resolvedProjectPath,
    options.outputEnvFile
  );

  if (!fileExists(downloadedEnvFile)) {
    throw new Error(
      `Expected file does not exist: ${downloadedEnvFile}, did the Vercel CLI command fail?`
    );
  }

  try {
    await fs.unlink(outputEnvFile);
    logger.debug(`Deleted existing environment file: ${outputEnvFile}`);
  } catch (e) {
    // assuming deletion failed due to the file missing
  }

  await fs.symlink(downloadedEnvFile, outputEnvFile, 'file');
  logger.info(`Created symlink from ${outputEnvFile} to ${downloadedEnvFile}`);
}

const runExecutor: Executor<PullExecutorSchema> = async (options, context) => {
  const { vercelCommand = 'vercel' } = getPluginConfig(context.workspace);

  const pullArgs = ['pull', '--environment', options.environment];

  if (options.debug) {
    pullArgs.push('--debug');
  }

  if (process.env.VERCEL_TOKEN) {
    logger.debug('Detected VERCEL_TOKEN, passing token to Vercel CLI');
    pullArgs.push('--token', process.env.VERCEL_TOKEN);
  }

  const projectPath = path.resolve(context.root, options.projectPath);

  // apparently we can set VERCEL_ORG_ID and VERCEL_PROJECT_ID instead
  linkVercelProject(projectPath, {
    projectId: options.projectId,
    orgId: options.orgId,
  });

  await exec(vercelCommand, pullArgs, {
    cwd: projectPath,
  });

  if (options.outputEnvFile) {
    ensureDotEnvSymlink(projectPath, options);
  }

  return { success: true };
};

export default runExecutor;
