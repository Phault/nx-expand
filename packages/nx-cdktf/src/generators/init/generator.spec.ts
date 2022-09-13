import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import { Tree, readJson, NxJsonConfiguration } from '@nrwl/devkit';
import generator from './generator';
import { InitGeneratorSchema } from './schema';

describe('init', () => {
  let tree: Tree;
  const schema: InitGeneratorSchema = {
    unitTestRunner: 'jest',
  };

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it('should add plugin to nx.json', async () => {
    await generator(tree, schema);
    const nxConfig = readJson<NxJsonConfiguration>(tree, 'nx.json');

    expect(nxConfig.plugins).toContain('nx-cdktf');
  });

  it('should add dependencies', async () => {
    await generator(tree, schema);
    const packageJson = readJson(tree, 'package.json');
    expect(packageJson.dependencies['nx-cdktf']).toBeDefined();
    expect(packageJson.dependencies['cdktf']).toBeDefined();
    expect(packageJson.dependencies['constructs']).toBeDefined();
    expect(packageJson.dependencies['tsx']).toBeDefined();
    expect(packageJson.devDependencies['@types/node']).toBeDefined();
  });

  it('should not add jest config if unitTestRunner is none', async () => {
    await generator(tree, { ...schema, unitTestRunner: 'none' });
    expect(tree.exists('jest.config.js')).toEqual(false);
  });
});
