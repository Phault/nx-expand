import { Executor, logger } from '@nrwl/devkit';
import { exec } from '@actions/exec';
import { getPluginConfig } from '../../utils/plugin-config';
import { PullExecutorSchema } from './schema';
import path = require('path');
import fs = require('fs/promises');
import { fileExists } from 'nx/src/utils/fileutils';
import { linkVercelProject } from '../../utils/linkVercelProject';

async function copyEnvironmentFile(
  resolvedProjectPath: string,
  options: PullExecutorSchema
) {
  if (!options.outputEnvFile) {
    throw new Error(
      `Can't create environment file, since outputEnvFile is not defined.`
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

  await fs.cp(downloadedEnvFile, outputEnvFile);
  logger.info(
    `Copied environment file from ${outputEnvFile} to ${downloadedEnvFile}`
  );
}

const runExecutor: Executor<PullExecutorSchema> = async (options, context) => {
  const { vercelCommand = 'vercel' } = getPluginConfig(context);

  if (!context.projectName) {
    throw new Error('nx-vercel requires projectName to be assigned');
  }

  const projectPath = path.resolve(
    context.root,
    context.workspace.projects[context.projectName].root
  );

  const pullArgs = [
    'pull',
    '--cwd',
    projectPath,
    '--environment',
    options.environment,
  ];

  if (options.debug) {
    pullArgs.push('--debug');
  }

  if (process.env.VERCEL_TOKEN) {
    logger.debug('Detected VERCEL_TOKEN, passing token to Vercel CLI');
    pullArgs.push('--token', process.env.VERCEL_TOKEN);
  }

  // apparently we can set VERCEL_ORG_ID and VERCEL_PROJECT_ID instead
  linkVercelProject(projectPath, {
    projectId: options.projectId,
    orgId: options.orgId,
  });

  await exec(vercelCommand, pullArgs, {
    cwd: context.root,
  });

  if (options.outputEnvFile) {
    await copyEnvironmentFile(projectPath, options);
  }

  return { success: true };
};

export default runExecutor;
