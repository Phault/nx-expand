export interface StickyPrCommentExecutorSchema {
  header: string;
  append?: boolean;
  deleteOldComment?: boolean;
  hideOldComment?: boolean;
  path?: string;
  message: string;
  recreate?: boolean;
  hideAndRecreate?: boolean;
} // eslint-disable-line
