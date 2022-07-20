import { logger } from '@nrwl/devkit';
import path = require('path');
import {
  fileExists,
  readJsonFile,
  writeJsonFile,
} from 'nx/src/utils/fileutils';
import { VercelProjectConfig } from './types';

export function linkVercelProject(
  outputPath: string,
  { projectId, orgId }: Pick<VercelProjectConfig, 'projectId' | 'orgId'>
) {
  const vercelProjectFile = path.resolve(outputPath, '.vercel/project.json');

  if (!fileExists(vercelProjectFile)) {
    logger.debug('Linked Vercel project');
    writeJsonFile(vercelProjectFile, {
      projectId,
      orgId,
    });
    return;
  }

  const currentVercelProject =
    readJsonFile<VercelProjectConfig>(vercelProjectFile);
  if (
    currentVercelProject.orgId === orgId &&
    currentVercelProject.projectId === projectId
  ) {
    logger.debug(
      'Vercel project already linked, skipping creation of ./vercel/project.json'
    );
    return;
  }

  throw new Error(
    `Found existing Vercel project config linked to a different project at '${vercelProjectFile}', assuming this is an error and aborting. ` +
      `Please delete the file manually if this is intended.`
  );
}
