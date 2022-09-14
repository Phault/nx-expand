import {
  checkFilesExist,
  ensureNxProject,
  readJson,
  runCommandAsync,
  runNxCommandAsync,
  uniq,
  updateFile,
} from '@nrwl/nx-plugin/testing';
import type { NxJsonConfiguration } from 'nx/src/config/nx-json';
import { getPackageManagerCommand } from '@nx-expand/utilities';

describe('nx-vercel e2e', () => {
  // Setting up individual workspaces per
  // test can cause e2e runs to take a long time.
  // For this reason, we recommend each suite only
  // consumes 1 workspace. The tests should each operate
  // on a unique project in the workspace, such that they
  // are not dependant on one another.
  beforeAll(() => {
    ensureNxProject('nx-vercel', 'dist/packages/nx-vercel');
    updateFile('nx.json', (originalRaw) => {
      const original = JSON.parse(originalRaw) as NxJsonConfiguration;

      const patched = {
        ...original,
        pluginsConfig: {
          ...original.pluginsConfig,
          'nx-vercel': {
            // for now we'll just use `echo`, but we should either mock vercel-cli or test against the real thing
            vercelCommand: 'echo',
          },
        },
      };

      return JSON.stringify(patched);
    });
  });

  describe('post-targets', () => {
    let project: string;
    beforeEach(async () => {
      project = uniq('post-targets');

      await runNxCommandAsync(
        `generate @nrwl/workspace:npm-package ${project}`
      );

      // we don't care for its contents, we just need the folder to exist
      updateFile(`libs/${project}/.vercel/project.json`, '');
    });

    it('can run post-targets', async () => {
      updateFile(
        `libs/${project}/project.json`,
        JSON.stringify({
          projectType: 'library',
          root: `libs/${project}`,
          targets: {
            deploy: {
              executor: 'nx-vercel:deploy-prebuilt',
              options: {
                buildPath: `dist/libs/${project}`,
                postTargets: [
                  `${project}:post-target`,
                  {
                    target: `${project}:post-target`,
                    overrides: {
                      commands: [
                        {
                          command: 'echo Post-target ran with overrides!',
                          // https://github.com/nrwl/nx/issues/11382
                          forwardAllArgs: false,
                        },
                      ],
                    },
                  },
                ],
              },
            },
            'post-target': {
              executor: 'nx:run-commands',
              options: {
                commands: [
                  {
                    command: 'echo Post-target ran without overrides!',
                    // https://github.com/nrwl/nx/issues/11382
                    forwardAllArgs: false,
                  },
                ],
              },
            },
          },
        })
      );

      const { stdout } = await runNxCommandAsync(`run ${project}:deploy`);

      expect(stdout).toContain('Post-target ran without overrides!');
      expect(stdout).toContain('Post-target ran with overrides!');
    }, 10000);

    it('enhances overrides with variable substitution', async () => {
      updateFile(
        `libs/${project}/project.json`,
        JSON.stringify({
          projectType: 'library',
          root: `libs/${project}`,
          targets: {
            deploy: {
              executor: 'nx-vercel:deploy-prebuilt',
              options: {
                buildPath: `dist/libs/${project}`,
                postTargets: [
                  `${project}:post-target`,
                  {
                    target: `${project}:post-target`,
                    overrides: {
                      commands: [
                        {
                          command: `echo 'With overrides: $SOME_ENV_VAR!'`,
                          // https://github.com/nrwl/nx/issues/11382
                          forwardAllArgs: false,
                        },
                      ],
                    },
                  },
                ],
              },
            },
            'post-target': {
              executor: 'nx:run-commands',
              options: {
                commands: [
                  {
                    command: `echo 'Without overrides: $SOME_ENV_VAR!'`,
                    // https://github.com/nrwl/nx/issues/11382
                    forwardAllArgs: false,
                  },
                ],
              },
            },
          },
        })
      );

      const pmc = getPackageManagerCommand();
      const { stdout } = await runCommandAsync(
        `SOME_ENV_VAR=inject-this ${pmc.exec} nx run ${project}:deploy`
      );

      expect(stdout).toContain('With overrides: inject-this!');
      expect(stdout).toContain('Without overrides: inject-this!');
    });
  });

  afterAll(() => {
    // `nx reset` kills the daemon, and performs
    // some work which can help clean up e2e leftovers
    runNxCommandAsync('reset');
  });
});
