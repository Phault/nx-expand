import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import { Tree, getProjects, readJson } from '@nrwl/devkit';
import generator from './generator';
import { CdktfApplicationGeneratorSchema } from './schema';
import { Linter } from '@nrwl/linter';
import { TsConfigJson } from 'type-fest';

function expectJestToBeConfigured(appTree: Tree, projectPath: string) {
  expect(appTree.exists(`${projectPath}src/my-stack.spec.ts`)).toBeTruthy();
  expect(appTree.exists(`${projectPath}test-setup.ts`)).toBeTruthy();

  const jestConfig = appTree.read(`${projectPath}jest.config.ts`)?.toString();
  expect(jestConfig).toContain('test-setup.ts');

  const tsconfig = readJson(appTree, `${projectPath}tsconfig.json`);
  expect(tsconfig.references).toContainEqual({
    path: './tsconfig.spec.json',
  });

  const tsconfigApp = readJson<TsConfigJson>(
    appTree,
    `${projectPath}tsconfig.app.json`
  );
  expect(tsconfigApp.exclude).toEqual(
    expect.arrayContaining([
      'jest.config.ts',
      '**/*.spec.ts',
      '**/*.test.ts',
      '**/*.spec.js',
      '**/*.test.js',
    ])
  );

  const tsconfigSpec = readJson<TsConfigJson>(
    appTree,
    `${projectPath}tsconfig.spec.json`
  );
  expect(tsconfigSpec.files).toContainEqual(
    expect.stringContaining('cdktf/lib/testing/adapters/jest.d.ts')
  );
}

describe('cdktf-application generator', () => {
  let appTree: Tree;
  const schema: CdktfApplicationGeneratorSchema = {
    name: 'my-app',
    linter: Linter.EsLint,
    unitTestRunner: 'jest',
  };

  beforeEach(() => {
    appTree = createTreeWithEmptyWorkspace();
  });

  it('should update workspace.json', async () => {
    await generator(appTree, schema);

    const projects = getProjects(appTree);

    expect(projects.get('my-app')?.root).toEqual('apps/my-app');
  });

  it('should update tags and implicit dependencies', async () => {
    await generator(appTree, { ...schema, tags: 'one,two' });

    const projects = Object.fromEntries(getProjects(appTree));
    expect(projects).toMatchObject({
      'my-app': {
        tags: ['one', 'two'],
      },
    });
  });

  it('should generate files', async () => {
    await generator(appTree, schema);

    expect(appTree.exists('apps/my-app/.gitignore')).toBeTruthy();
    expect(appTree.exists('apps/my-app/cdktf.json')).toBeTruthy();
    expect(appTree.exists('apps/my-app/src/app.ts')).toBeTruthy();
    expect(appTree.exists('apps/my-app/src/my-stack.ts')).toBeTruthy();
    expect(appTree.exists('apps/my-app/.eslintrc.json')).toBeTruthy();

    const tsconfig = readJson(appTree, 'apps/my-app/tsconfig.json');
    expect(tsconfig.references).toContainEqual({
      path: './tsconfig.app.json',
    });

    const tsconfigApp = readJson<TsConfigJson>(
      appTree,
      'apps/my-app/tsconfig.app.json'
    );
    expect(tsconfigApp.compilerOptions?.outDir).toEqual('../../dist/out-tsc');
    expect(tsconfigApp.extends).toEqual('./tsconfig.json');

    expectJestToBeConfigured(appTree, 'apps/my-app/');
  });

  it('should extend from root tsconfig.base.json', async () => {
    await generator(appTree, schema);

    const tsConfig = readJson<TsConfigJson>(
      appTree,
      'apps/my-app/tsconfig.json'
    );
    expect(tsConfig.extends).toEqual('../../tsconfig.base.json');
  });

  it('should extend from root tsconfig.json when no tsconfig.base.json', async () => {
    appTree.rename('tsconfig.base.json', 'tsconfig.json');

    await generator(appTree, schema);

    const tsConfig = readJson<TsConfigJson>(
      appTree,
      'apps/my-app/tsconfig.json'
    );
    expect(tsConfig.extends).toEqual('../../tsconfig.json');
  });
});
