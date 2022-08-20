/* eslint-disable @typescript-eslint/no-explicit-any */
import { JsonObject, JsonValue } from 'type-fest';
import {
  Context,
  OpeningAndClosingTags,
  PartialsOrLookupFn,
  render as renderString,
  RenderOptions,
} from 'mustache';

export { renderString };

export function renderArray(
  input: JsonValue[],
  view: any | Context,
  partials?: PartialsOrLookupFn,
  tagsOrOptions?: OpeningAndClosingTags | RenderOptions
) {
  return input.map((input) => render(input, view, partials, tagsOrOptions));
}

export function renderObject(
  input: JsonObject,
  view: any | Context,
  partials?: PartialsOrLookupFn,
  tagsOrOptions?: OpeningAndClosingTags | RenderOptions
): JsonObject {
  return Object.fromEntries(
    Object.entries(input).map(([key, value]) => {
      const processedKey = renderString(key, view, partials, tagsOrOptions);
      return [
        processedKey,
        value ? render(value, view, partials, tagsOrOptions) : value,
      ];
    })
  );
}

export function render(
  input: JsonValue,
  view: any | Context,
  partials?: PartialsOrLookupFn,
  tagsOrOptions?: OpeningAndClosingTags | RenderOptions
): JsonValue {
  if (typeof input === 'string') {
    return renderString(input, view, partials, tagsOrOptions);
  }

  if (Array.isArray(input)) {
    return renderArray(input, view, partials, tagsOrOptions);
  }

  if (typeof input === 'object' && input) {
    return renderObject(input, view, partials, tagsOrOptions);
  }

  return input;
}
