import type { JsonObject } from 'type-fest';

export type PrCommentExecutorSchema = {
  /**
   * The number of the PR to comment on.
   *
   * If not provided, we'll attempt to read it from GitHub CI context.
   */
  prNumber?: number;

  /**
   * The message of the comment to post.
   */
  message: Message;

  /**
   * Options for controlling the stickiness of the comment.
   */
  sticky?: StickyOptions;
};

export type Message = {
  type: 'inline' | 'file';
  content: string;

  /**
   * Optional variables to make available via parameter expansion in the message.
   *
   * Environment variables are always available under the `env` object e.g.
   * `${{ env.MY_ENV_VAR }}`.
   */
  variables?: JsonObject;
};

/**
 * Options for controlling the stickiness of the comment.
 */
export type StickyOptions = {
  /**
   * A header for the sticky comment, used to find existing instances of this
   * sticky comment.
   */
  header: string;

  /**
   * Whether the message be appended to the message of the most recent sticky
   * comment instance found with the same {@link header}.
   *
   * @default false
   */
  append?: boolean;

  /**
   * What action to perform if we find an existing sticky comment instance with
   * the same {@link header}.
   *
   * @default "update"
   */
  action?: 'hide-previous' | 'recreate' | 'update';
};
