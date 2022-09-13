import {
  addProjectConfiguration,
  formatFiles,
  generateFiles,
  getPackageManagerCommand,
  getWorkspaceLayout,
  joinPathFragments,
  names,
  offsetFromRoot,
  Tree,
  updateJson,
} from '@nrwl/devkit';
import { lintProjectGenerator } from '@nrwl/linter';
import * as path from 'path';
import { CdktfApplicationGeneratorSchema } from './schema';
import { runTasksInSerial } from '@nrwl/workspace/src/utilities/run-tasks-in-serial';
import cdktfInitGenerator from '../init/generator';
import { jestProjectGenerator } from '@nrwl/jest';
import { TsConfigJson } from 'type-fest';
import { getRelativePathToRootTsConfig } from '@nrwl/workspace/src/utilities/typescript';

interface NormalizedSchema extends CdktfApplicationGeneratorSchema {
  projectName: string;
  projectRoot: string;
  projectDirectory: string;
  parsedTags: string[];
}

function normalizeOptions(
  host: Tree,
  options: CdktfApplicationGeneratorSchema
): NormalizedSchema {
  const name = names(options.name).fileName;
  const projectDirectory = options.directory
    ? `${names(options.directory).fileName}/${name}`
    : name;
  const projectName = projectDirectory.replace(new RegExp('/', 'g'), '-');
  const projectRoot = `${getWorkspaceLayout(host).appsDir}/${projectDirectory}`;
  const parsedTags = options.tags
    ? options.tags.split(',').map((s) => s.trim())
    : [];

  return {
    ...options,
    projectName,
    projectRoot,
    projectDirectory,
    parsedTags,
    unitTestRunner: options.unitTestRunner ?? 'jest',
  };
}

function addFiles(host: Tree, options: NormalizedSchema) {
  const templateOptions = {
    ...options,
    ...names(options.name),
    offsetFromRoot: offsetFromRoot(options.projectRoot),
    tmpl: '',
    rootTsConfigPath: getRelativePathToRootTsConfig(host, options.projectRoot),
    execCommand: getPackageManagerCommand().exec,
  };

  generateFiles(
    host,
    path.join(__dirname, 'files/common'),
    options.projectRoot,
    templateOptions
  );

  if (options.unitTestRunner === 'jest') {
    generateFiles(
      host,
      path.join(__dirname, 'files/jest'),
      options.projectRoot,
      templateOptions
    );
  }
}

async function addLinting(host: Tree, options: NormalizedSchema) {
  return await lintProjectGenerator(host, {
    linter: options.linter,
    project: options.projectName,
    tsConfigPaths: [
      joinPathFragments(options.projectRoot, 'tsconfig.app.json'),
    ],
    unitTestRunner: options.unitTestRunner,
    eslintFilePatterns: [`${options.projectRoot}/**/*.{ts,tsx,js,jsx}`],
    skipFormat: true,
  });
}

async function addJest(host: Tree, options: NormalizedSchema) {
  if (options.unitTestRunner !== 'jest') {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    return () => {};
  }

  return await jestProjectGenerator(host, {
    project: options.projectName,
    supportTsx: false,
    skipSerializers: true,
    testEnvironment: 'node',
    setupFile: 'none',
    compiler: 'tsc',
  });
}

function addProject(host: Tree, options: NormalizedSchema) {
  addProjectConfiguration(host, options.projectName, {
    root: options.projectRoot,
    projectType: 'application',
    sourceRoot: `${options.projectRoot}/src`,
    targets: {},
    tags: options.parsedTags,
  });
}

export function updateJestConfigContent(content: string) {
  return content.replace(
    'transform: {',
    'setupFilesAfterEnv: ["<rootDir>/test-setup.ts"],\n    transform: {'
  );
}

export function updateJestConfig(host: Tree, options: NormalizedSchema) {
  if (options.unitTestRunner !== 'jest') {
    return;
  }

  updateJson(
    host,
    `${options.projectRoot}/tsconfig.spec.json`,
    (json: TsConfigJson) => {
      const offset = offsetFromRoot(options.projectRoot);
      json.files = [
        `${offset}node_modules/cdktf/lib/testing/adapters/jest.d.ts`,
      ];
      return json;
    }
  );

  const configPath = `${options.projectRoot}/jest.config.ts`;
  const originalContent = host.read(configPath, 'utf-8');
  const content = updateJestConfigContent(originalContent ?? '');
  host.write(configPath, content);
}

export default async function (
  host: Tree,
  schema: CdktfApplicationGeneratorSchema
) {
  const options = normalizeOptions(host, schema);

  const initTask = await cdktfInitGenerator(host, options);

  addFiles(host, options);
  addProject(host, options);
  const lintTask = await addLinting(host, options);
  const jestTask = await addJest(host, options);
  updateJestConfig(host, options);

  await formatFiles(host);

  return runTasksInSerial(initTask, lintTask, jestTask);
}
