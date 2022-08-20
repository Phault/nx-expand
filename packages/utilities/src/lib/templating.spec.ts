import { renderArray, renderObject, renderString } from './templating';

describe('renderString', () => {
  it('expands parameters', () => {
    const actual = renderString('Hello {{someParameter}}!', {
      someParameter: 'world',
    });

    expect(actual).toBe('Hello world!');
  });

  it('unknown parameters are removed', () => {
    const actual = renderString('Hello {{someUnknownParameter}}!', {});

    expect(actual).toBe('Hello !');
  });
});

describe('renderArray', () => {
  it('expands parameters', () => {
    const actual = renderArray(['Hello {{someParameter}}!'], {
      someParameter: 'world',
    });

    expect(actual).toEqual(['Hello world!']);
  });

  it('is recursive', () => {
    const actual = renderArray(
      [
        'Hello {{someParameter}}!',
        ['Hello {{someParameter}}!', ['Hello {{someParameter}}!']],
      ],
      {
        someParameter: 'world',
      }
    );

    expect(actual).toEqual([
      'Hello world!',
      ['Hello world!', ['Hello world!']],
    ]);
  });

  it('keeps non-string variables', () => {
    const actual = renderArray([1, false], {});

    expect(actual).toEqual([1, false]);
  });
});

describe('renderObject', () => {
  it('expands parameters', () => {
    const actual = renderObject(
      {
        greeting: 'Hello {{someParameter}}!',
      },
      {
        someParameter: 'world',
      }
    );

    expect(actual).toEqual({ greeting: 'Hello world!' });
  });

  it('is recursive', () => {
    const actual = renderObject(
      {
        greeting: 'Hello {{someParameter}}!',
        nested: {
          greeting: 'Hello {{someParameter}}!',
          superNested: {
            greeting: 'Hello {{someParameter}}!',
          },
        },
      },
      {
        someParameter: 'world',
      }
    );

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
    const actual = renderObject(
      {
        someNum: 1,
        someBoolean: false,
      },
      {}
    );

    expect(actual).toEqual({ someNum: 1, someBoolean: false });
  });
});
