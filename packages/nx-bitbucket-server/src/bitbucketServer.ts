import { PrActivity } from './types/activities';
import { Comment, PaginatedResults, PaginationParams } from './types/base';
import fetch, { Headers, HeadersInit, Response } from 'node-fetch';

export type BitbucketServerOptions = {
  auth: string;
  baseUrl: string;
};

export type RequestOptions = {
  method?: string;
  headers?: HeadersInit;
  params?: URLSearchParams;
  body?: unknown;
};

export class BitbucketServer {
  constructor(private options: BitbucketServerOptions) {}

  public async request<T>(path: string, options?: RequestOptions) {
    const headers = new Headers(options?.headers);

    headers.set('Authorization', `Bearer ${this.options.auth}`);
    headers.set('Accept', 'application/json');

    if (options?.body && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    const url = new URL(path, this.options.baseUrl);
    url.search = options?.params?.toString() ?? '';
    const response = await fetch(url.toString(), {
      method: options?.method,
      headers,
      body: options?.body ? JSON.stringify(options?.body) : undefined,
    });

    if (response.ok) {
      let data;

      try {
        data = await response.json();
      } catch {
        data = undefined;
      }

      return data as T;
    }

    throw new ResponseError(response, 'Response returned an error code');
  }

  public async getPullRequestActivity({
    projectKey,
    repositorySlug,
    pullRequestId,
    start,
    limit,
  }: {
    projectKey: string;
    repositorySlug: string;
    pullRequestId: number;
  } & PaginationParams) {
    const params = new URLSearchParams();

    if (start) {
      params.append('start', start.toString());
    }

    if (limit) {
      params.append('limit', limit.toString());
    }

    return this.request<PaginatedResults<PrActivity>>(
      `/rest/api/1.0/projects/${projectKey}/repos/${repositorySlug}/pull-requests/${pullRequestId}/activities`,
      {
        params,
      }
    );
  }

  public async createPullRequestComment({
    projectKey,
    repositorySlug,
    pullRequestId,
    text,
  }: {
    projectKey: string;
    repositorySlug: string;
    pullRequestId: number;
    text: string;
  }) {
    return this.request<Comment>(
      `/rest/api/1.0/projects/${projectKey}/repos/${repositorySlug}/pull-requests/${pullRequestId}/comments`,
      {
        method: 'POST',
        body: { text },
      }
    );
  }

  public async updatePullRequestComment({
    projectKey,
    repositorySlug,
    pullRequestId,
    commentId,
    text,
    version,
  }: {
    projectKey: string;
    repositorySlug: string;
    pullRequestId: number;
    commentId: number;
    text: string;
    version: number;
  }) {
    return this.request<Comment>(
      `/rest/api/1.0/projects/${projectKey}/repos/${repositorySlug}/pull-requests/${pullRequestId}/comments/${commentId}`,
      {
        method: 'PUT',
        body: {
          text,
          version,
        },
      }
    );
  }

  public async deletePullRequestComment({
    projectKey,
    repositorySlug,
    pullRequestId,
    commentId,
    version,
  }: {
    projectKey: string;
    repositorySlug: string;
    pullRequestId: number;
    commentId: number;
    version?: number;
  }) {
    const params = new URLSearchParams();

    if (version !== undefined) {
      params.append('version', version.toString());
    }

    return this.request<void>(
      `/rest/api/1.0/projects/${projectKey}/repos/${repositorySlug}/pull-requests/${pullRequestId}/comments/${commentId}`,
      {
        method: 'DELETE',
        params,
      }
    );
  }
}

export class ResponseError extends Error {
  name: 'ResponseError' = 'ResponseError';
  constructor(public response: Response, msg?: string) {
    super(msg);
  }
}
