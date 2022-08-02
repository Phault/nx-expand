/**
 * @file
 *
 * Based on https://github.com/marocchino/sticky-pull-request-comment
 *
 * @license
 * The MIT License (MIT)
 *
 * Copyright (c) 2018 GitHub, Inc. and contributors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
import {
  IssueComment,
  ReportedContentClassifiers,
  Repository,
  User,
} from '@octokit/graphql-schema';
import { GitHub } from '@actions/github/lib/utils';

function getStickyCommentHeader(header: string) {
  // purposely kept the same as marocchino/sticky-pull-request-comment,
  // because why not keep the compatibility?
  return `<!-- Sticky Pull Request Comment${header} -->`;
}

function getCommentMessage(
  body: string,
  header?: string,
  previousMessage?: string
) {
  // previousMessage already contains the header
  if (previousMessage) {
    return `${previousMessage}\n${body}`;
  }

  return header ? `${getStickyCommentHeader(header)}\n${body}` : body;
}

export async function findPreviousComment(
  octokit: InstanceType<typeof GitHub>,
  repo: {
    owner: string;
    repo: string;
  },
  number: number,
  header: string
): Promise<IssueComment | null> {
  let after: string | null | undefined;
  let hasNextPage = true;
  const commentHeader = getStickyCommentHeader(header);

  while (hasNextPage) {
    const data = await octokit.graphql<{
      repository: Repository;
      viewer: User;
    }>(
      `
      query($repo: String! $owner: String! $number: Int! $after: String) {
        viewer { login }
        repository(name: $repo owner: $owner) {
          pullRequest(number: $number) {
            comments(first: 100 after: $after) {
              nodes {
                id
                author {
                  login
                }
                isMinimized
                body
              }
              pageInfo {
                endCursor
                hasNextPage
              }
            }
          }
        }
      }
      `,
      { ...repo, after, number }
    );

    const viewer = data.viewer as User;
    const repository = data.repository as Repository;
    const target = repository.pullRequest?.comments?.nodes?.find(
      (node: IssueComment | null | undefined) =>
        node?.author?.login === viewer.login.replace('[bot]', '') &&
        !node?.isMinimized &&
        node?.body?.includes(commentHeader)
    );

    if (target) {
      return target;
    }

    after = repository.pullRequest?.comments?.pageInfo?.endCursor;
    hasNextPage =
      repository.pullRequest?.comments?.pageInfo?.hasNextPage ?? false;
  }

  return null;
}

export async function updateComment(
  octokit: InstanceType<typeof GitHub>,
  id: string,
  body: string,
  header: string,
  previousBody?: string
): Promise<void> {
  if (!body) {
    throw new Error('Comment body cannot be blank');
  }

  await octokit.graphql(
    `
    mutation($input: UpdateIssueCommentInput!) {
      updateIssueComment(input: $input) {
        issueComment {
          id
          body
        }
      }
    }
    `,
    {
      input: {
        id,
        body: getCommentMessage(body, header, previousBody),
      },
    }
  );
}
export async function createComment(
  octokit: InstanceType<typeof GitHub>,
  repo: {
    owner: string;
    repo: string;
  },
  issueNumber: number,
  body: string,
  header?: string,
  previousBody?: string
): Promise<void> {
  if (!body) throw new Error('Comment body cannot be blank');

  await octokit.rest.issues.createComment({
    ...repo,
    issue_number: issueNumber,
    body: getCommentMessage(body, header, previousBody),
  });
}

export async function deleteComment(
  octokit: InstanceType<typeof GitHub>,
  id: string
): Promise<void> {
  await octokit.graphql(
    `
    mutation($id: ID!) {
      deleteIssueComment(input: { id: $id }) {
        clientMutationId
      }
    }
    `,
    { id }
  );
}

export async function minimizeComment(
  octokit: InstanceType<typeof GitHub>,
  subjectId: string,
  classifier: ReportedContentClassifiers
): Promise<void> {
  await octokit.graphql(
    `
    mutation($input: MinimizeCommentInput!) { 
      minimizeComment(input: $input) {
        clientMutationId
      }
    }
    `,
    { input: { subjectId, classifier } }
  );
}
