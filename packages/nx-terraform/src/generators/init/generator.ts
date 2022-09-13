import {
  addDependenciesToPackageJson,
  GeneratorCallback,
  NxJsonConfiguration,
  readJson,
  removeDependenciesFromPackageJson,
  Tree,
  updateJson,
} from '@nrwl/devkit';
import { jestInitGenerator } from '@nrwl/jest';
import { runTasksInSerial } from '@nrwl/workspace/src/utilities/run-tasks-in-serial';
import { PackageJson } from 'nx/src/utils/package-json';
import {
  cdktfVersion,
  constructsVersion,
  pluginVersion,
  tsxVersion,
} from '../../utils/versions';
import { InitGeneratorSchema } from './schema';

function addPluginToNxConfig(host: Tree) {
  updateJson(host, 'nx.json', (json: NxJsonConfiguration) => {
    const plugins = json.plugins ?? [];

    if (!plugins.includes('nx-terraform')) {
      plugins.push('nx-terraform');
    }

    return {
      ...json,
      plugins,
    };
  });
}

function updateDependencies(host: Tree) {
  const packageJson = readJson<PackageJson>(host, 'package.json');

  const majorNodeVersion = process.versions.node.split('.').shift();
  const typesNodeVersion = `^${majorNodeVersion}`;

  const hasNodeTypes =
    '@types/node' in
    (packageJson.dependencies ?? packageJson.devDependencies ?? {});

  const currentTsxVersion =
    packageJson.dependencies?.['tsx'] ?? packageJson.devDependencies?.['tsx'];

  removeDependenciesFromPackageJson(host, [], ['nx-terraform', 'tsx']);

  return addDependenciesToPackageJson(
    host,
    {
      'nx-terraform': pluginVersion,
      cdktf: cdktfVersion,
      'cdktf-cli': cdktfVersion,
      constructs: constructsVersion,
      tsx: currentTsxVersion ?? tsxVersion,
    },
    {
      ...(!hasNodeTypes && { '@types/node': typesNodeVersion }),
    }
  );
}

export default async function (host: Tree, options: InitGeneratorSchema) {
  const tasks: GeneratorCallback[] = [];

  addPluginToNxConfig(host);

  if (!options.unitTestRunner || options.unitTestRunner === 'jest') {
    const jestTask = jestInitGenerator(host, {
      compiler: 'tsc',
    });
    tasks.push(jestTask);
  }

  const installTask = updateDependencies(host);
  tasks.push(installTask);

  return runTasksInSerial(...tasks);
}
