import type { Commit, User, Comment } from './base';

export type BasePrActivity = {
  action: string;
  id: number;
  createdDate: number;
  user: User;
};

export type CommentedPrActivity = BasePrActivity & {
  action: 'COMMENTED';
  commentAction: 'ADDED';
  comment: Comment;
  commentAnchor?: unknown;
  diff?: unknown;
};

export type OpenedPrActivity = BasePrActivity & {
  action: 'OPENED';
};

export type ApprovedPrActivity = BasePrActivity & {
  action: 'APPROVED';
};

export type UpdatedPrActivity = BasePrActivity & {
  action: 'UPDATED';
  addedReviewers: User[];
  removedReviewers: User[];
};

export type RescopedPrActivity = {
  action: 'RESCOPED';
  fromHash: string;
  previousFromHash: string;
  previousToHash: string;
  toHash: string;
  added: {
    commits: Commit[];
    total: number;
  };
  removed: { commits: Commit[]; total: number };
};

export type PrActivity =
  | CommentedPrActivity
  | OpenedPrActivity
  | ApprovedPrActivity
  | UpdatedPrActivity
  | RescopedPrActivity;
