import {
  expandParametersInArray,
  expandParametersInObject,
  expandParametersInString,
} from './parameter-expansion';

describe('expandParametersInString', () => {
  it('expands parameters', () => {
    const actual = expandParametersInString('Hello ${{ someParameter }}!', {
      someParameter: 'world',
    });

    expect(actual).toBe('Hello world!');
  });

  it('unknown parameters are removed', () => {
    const actual = expandParametersInString(
      'Hello ${{ someUnknownParameter }}!',
      {}
    );

    expect(actual).toBe('Hello !');
  });
});

describe('expandParametersInArray', () => {
  it('expands parameters', () => {
    const actual = expandParametersInArray(['Hello ${{ someParameter }}!'], {
      someParameter: 'world',
    });

    expect(actual).toEqual(['Hello world!']);
  });

  it('is recursive', () => {
    const actual = expandParametersInArray(
      [
        'Hello ${{ someParameter }}!',
        ['Hello ${{ someParameter }}!', ['Hello ${{ someParameter }}!']],
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
    const actual = expandParametersInArray([1, false], {});

    expect(actual).toEqual([1, false]);
  });
});

describe('expandParametersInObject', () => {
  it('expands parameters', () => {
    const actual = expandParametersInObject(
      {
        greeting: 'Hello ${{ someParameter }}!',
      },
      {
        someParameter: 'world',
      }
    );

    expect(actual).toEqual({ greeting: 'Hello world!' });
  });

  it('is recursive', () => {
    const actual = expandParametersInObject(
      {
        greeting: 'Hello ${{ someParameter }}!',
        nested: {
          greeting: 'Hello ${{ someParameter }}!',
          superNested: {
            greeting: 'Hello ${{ someParameter }}!',
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
    const actual = expandParametersInObject(
      {
        someNum: 1,
        someBoolean: false,
      },
      {}
    );

    expect(actual).toEqual({ someNum: 1, someBoolean: false });
  });
});
