import { JsonObject, JsonValue } from 'type-fest';
import { get } from 'lodash';

export function expandParametersInString(input: string, variables: JsonObject) {
  return input.replace(
    /\${{\s?(\S+?)\s?}}/g,
    (_match, path) => get(variables, path)?.toString() ?? ''
  );
}

export function expandParametersInArray(
  input: JsonValue[],
  variables: JsonObject
) {
  return input.map((input) => expandParameters(input, variables));
}

export function expandParametersInObject(
  input: JsonObject,
  variables: JsonObject
): JsonObject {
  return Object.fromEntries(
    Object.entries(input).map(([key, value]) => {
      const processedKey = expandParametersInString(key, variables);
      return [processedKey, value ? expandParameters(value, variables) : value];
    })
  );
}

export function expandParameters(
  input: JsonValue,
  variables: JsonObject
): JsonValue {
  if (typeof input === 'string') {
    return expandParametersInString(input, variables);
  }

  if (Array.isArray(input)) {
    return expandParametersInArray(input, variables);
  }

  if (typeof input === 'object' && input) {
    return expandParametersInObject(input, variables);
  }

  return input;
}
