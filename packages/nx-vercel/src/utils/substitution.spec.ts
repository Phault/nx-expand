import {
  substituteEnvVarsInArray,
  substituteEnvVarsInObject,
  substituteEnvVarsInString,
} from './substitution';

describe('substituteEnvVarsInString', () => {
  it('replaces environmental variables', () => {
    process.env.SOME_ENV_VAR = 'world';

    const actual = substituteEnvVarsInString('Hello $SOME_ENV_VAR!');

    expect(actual).toBe('Hello world!');
  });

  it('name can be wrapped in curly brackets', () => {
    process.env.SOME_ENV_VAR = 'world';

    const actual = substituteEnvVarsInString('Hello ${SOME_ENV_VAR}!');

    expect(actual).toBe('Hello world!');
  });

  it('placeholders for unknown variables are removed', () => {
    const actual = substituteEnvVarsInString('Hello $SOME_UNKNOWN_ENV_VAR!');

    expect(actual).toBe('Hello !');
  });
});

describe('substituteEnvVarsInArray', () => {
  it('replaces environmental variables', () => {
    process.env.SOME_ENV_VAR = 'world';

    const actual = substituteEnvVarsInArray(['Hello $SOME_ENV_VAR!']);

    expect(actual).toEqual(['Hello world!']);
  });

  it('is recursive', () => {
    process.env.SOME_ENV_VAR = 'world';

    const actual = substituteEnvVarsInArray([
      'Hello $SOME_ENV_VAR!',
      ['Hello $SOME_ENV_VAR!', ['Hello $SOME_ENV_VAR!']],
    ]);

    expect(actual).toEqual([
      'Hello world!',
      ['Hello world!', ['Hello world!']],
    ]);
  });

  it('keeps non-string variables', () => {
    const actual = substituteEnvVarsInArray([1, false]);

    expect(actual).toEqual([1, false]);
  });
});

describe('substituteEnvVarsInObject', () => {
  it('replaces environmental variables', () => {
    process.env.SOME_ENV_VAR = 'world';

    const actual = substituteEnvVarsInObject({
      greeting: 'Hello $SOME_ENV_VAR!',
    });

    expect(actual).toEqual({ greeting: 'Hello world!' });
  });

  it('is recursive', () => {
    process.env.SOME_ENV_VAR = 'world';

    const actual = substituteEnvVarsInObject({
      greeting: 'Hello $SOME_ENV_VAR!',
      nested: {
        greeting: 'Hello $SOME_ENV_VAR!',
        superNested: {
          greeting: 'Hello $SOME_ENV_VAR!',
        },
      },
    });

    expect(actual).toEqual({
      greeting: 'Hello world!',
      nested: {
        greeting: 'Hello world!',
        superNested: {
          greeting: 'Hello world!',
        },
      },
    });
  });

  it('keeps non-string variables', () => {
    const actual = substituteEnvVarsInObject({
      someNum: 1,
      someBoolean: false,
    });

    expect(actual).toEqual({ someNum: 1, someBoolean: false });
  });
});
