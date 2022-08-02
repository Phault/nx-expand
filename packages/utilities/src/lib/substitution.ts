import { JsonObject, JsonValue } from 'type-fest';

export function substituteEnvVarsInString(input: string) {
  return input.replace(
    /\${?([a-zA-Z0-9_]+)?}?/g,
    (_match, group) => process.env[group] ?? ''
  );
}

export function substituteEnvVarsInArray(input: JsonValue[]) {
  return input.map(substituteEnvVars);
}

export function substituteEnvVarsInObject(input: JsonObject): JsonObject {
  return Object.fromEntries(
    Object.entries(input).map(([key, value]) => {
      const processedKey = substituteEnvVarsInString(key);
      return [processedKey, value ? substituteEnvVars(value) : value];
    })
  );
}

export function substituteEnvVars(input: JsonValue): JsonValue {
  if (typeof input === 'string') {
    return substituteEnvVarsInString(input);
  }

  if (Array.isArray(input)) {
    return substituteEnvVarsInArray(input);
  }

  if (typeof input === 'object' && input) {
    return substituteEnvVarsInObject(input);
  }

  return input;
}
