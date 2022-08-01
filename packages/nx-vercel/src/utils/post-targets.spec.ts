import { normalizePostTargets } from './post-targets';

describe('normalizePostTargets', () => {
  type TestCase = {
    input: Parameters<typeof normalizePostTargets>[0];
    expected: ReturnType<typeof normalizePostTargets>;
  };

  const testCases: Record<string, TestCase> = {
    'input can be target strings': {
      input: ['my-app:build', 'my-app:build:production'],
      expected: [
        {
          target: {
            project: 'my-app',
            target: 'build',
          },
        },
        {
          target: {
            project: 'my-app',
            target: 'build',
            configuration: 'production',
          },
        },
      ],
    },

    'input can be target objects': {
      input: [
        { project: 'my-app', target: 'build' },
        { project: 'my-app', target: 'build', configuration: 'production' },
      ],
      expected: [
        {
          target: {
            project: 'my-app',
            target: 'build',
          },
        },
        {
          target: {
            project: 'my-app',
            target: 'build',
            configuration: 'production',
          },
        },
      ],
    },

    'input can be post-target with target string': {
      input: [
        {
          target: 'my-app:lint',
          overrides: {
            maxWarnings: 0,
          },
        },
      ],
      expected: [
        {
          target: { project: 'my-app', target: 'lint' },
          overrides: {
            maxWarnings: 0,
          },
        },
      ],
    },

    'input can be post-target with target object': {
      input: [
        {
          target: { project: 'my-app', target: 'lint' },
          overrides: {
            maxWarnings: 0,
          },
        },
      ],
      expected: [
        {
          target: { project: 'my-app', target: 'lint' },
          overrides: {
            maxWarnings: 0,
          },
        },
      ],
    },

    'input can be mixed types': {
      input: [
        'my-app:build:production',
        {
          project: 'my-app',
          target: 'serve',
          configuration: 'preview',
        },
        {
          target: 'my-app:lint',
          overrides: {
            maxWarnings: 0,
          },
        },
        {
          target: { project: 'my-app', target: 'test' },
          overrides: {
            ci: true,
          },
        },
      ],
      expected: [
        {
          target: {
            project: 'my-app',
            target: 'build',
            configuration: 'production',
          },
        },
        {
          target: {
            project: 'my-app',
            target: 'serve',
            configuration: 'preview',
          },
        },
        {
          target: { project: 'my-app', target: 'lint' },
          overrides: {
            maxWarnings: 0,
          },
        },
        {
          target: { project: 'my-app', target: 'test' },
          overrides: {
            ci: true,
          },
        },
      ],
    },
  };

  test.each(Object.entries(testCases))('%s', (_name, { input, expected }) => {
    const actual = normalizePostTargets(input);
    expect(actual).toEqual(expected);
  });
});
