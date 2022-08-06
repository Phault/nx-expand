export type Link = { href: string };

export type User = {
  name: string;
  emailAddress: string;
  id: number;
  displayName: string;
  active: boolean;
  slug: string;
  type: 'NORMAL';
  links: Record<string, Link[]>;
};

export type Commit = {
  id: string;
  displayId: string;
  author: User;
  authorTimestamp: number;
  committer: User;
  committerTimestamp: number;
  message: string;
  parents: Pick<Commit, 'id' | 'displayId'>[];
  properties: { 'jira-key': string[] };
};

export type Comment = {
  properties: { repositoryId: number };
  id: number;
  version: number;
  text: string;
  author: User;
  createdDate: number;
  updatedDate: number;
  comments: Comment[];

  /**
   * Never seen this with a value.
   */
  tasks: unknown[];
  permittedOperations: { editable: boolean; deletable: boolean };
};

export type PaginationParams = {
  start?: number;
  limit?: number;
};

export type PaginatedResults<T> = {
  size: number;
  start: number;
  limit: number;
  isLastPage: boolean;
  values: T[];
};

export type Error = {
  context: null;
  message: string;
  exceptionName: string;
};

export type ErrorResponse = {
  errors: Error[];
};
