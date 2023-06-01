import type { ProjectSettings } from '@vercel/build-utils/dist';
import path = require('path');
import { VercelProjectConfig } from './types';
import { logger, readJsonFile, writeJsonFile } from '@nrwl/devkit';

export type VercelProjectPatch = Pick<
  ProjectSettings,
  | 'framework'
  | 'buildCommand'
  | 'installCommand'
  | 'outputDirectory'
  | 'devCommand'
  | 'rootDirectory'
  | 'directoryListing'
  | 'nodeVersion'
>;

export function patchVercelProject(
  projectPath: string,
  overrides: VercelProjectPatch
) {
  const vercelProjectFile = path.resolve(projectPath, '.vercel/project.json');

  const currentVercelProject =
    readJsonFile<VercelProjectConfig>(vercelProjectFile);

  const patchedVercelProject = {
    ...currentVercelProject,
    settings: {
      ...currentVercelProject.settings,
      ...overrides,
    },
  };

  writeJsonFile(vercelProjectFile, patchedVercelProject);
  logger.debug('Patched Vercel project');
}
