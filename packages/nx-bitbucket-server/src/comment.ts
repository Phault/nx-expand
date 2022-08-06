import { BitbucketServer } from './bitbucketServer';
import { CommentedPrActivity, PrActivity } from './types/activities';
import { Comment } from './types/base';

function getStickyCommentHeader(header: string) {
  // we abuse link labels to insert hidden text (see https://stackoverflow.com/a/32190021)
  return `\n\n[//]: # (Pull Request Comment: ${header})`;
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
  client: InstanceType<typeof BitbucketServer>,
  projectKey: string,
  repositorySlug: string,
  pullRequestId: number,
  header: string
): Promise<Comment | null> {
  let start: number | undefined;
  let hasNextPage = true;
  const commentHeader = getStickyCommentHeader(header);

  while (hasNextPage) {
    const data = await client.getPullRequestActivity({
      projectKey,
      repositorySlug,
      pullRequestId,
      start,
      limit: 1000,
    });

    const target = data.values.find((activity: PrActivity) => {
      if (activity.action !== 'COMMENTED') return false;

      return (
        // assuming it's editable because we're the author, otherwise we'll have
        // to find our user id first
        activity.comment.permittedOperations.editable &&
        activity.comment.text.includes(commentHeader)
      );
    }) as CommentedPrActivity | undefined;

    if (target) {
      return target.comment;
    }

    start = data.size;
    hasNextPage = !data.isLastPage;
  }

  return null;
}

export async function updateComment(
  client: InstanceType<typeof BitbucketServer>,
  projectKey: string,
  repositorySlug: string,
  pullRequestId: number,
  commentId: number,
  commentVersion: number,
  body: string,
  header: string,
  previousBody?: string
): Promise<void> {
  if (!body) {
    throw new Error('Comment body cannot be blank');
  }

  await client.updatePullRequestComment({
    projectKey,
    repositorySlug,
    pullRequestId,
    commentId,
    version: commentVersion,
    text: getCommentMessage(body, header, previousBody),
  });
}

export async function createComment(
  client: InstanceType<typeof BitbucketServer>,
  projectKey: string,
  repositorySlug: string,
  pullRequestId: number,
  body: string,
  header?: string,
  previousBody?: string
): Promise<void> {
  if (!body) throw new Error('Comment body cannot be blank');

  await client.createPullRequestComment({
    projectKey,
    pullRequestId,
    repositorySlug,
    text: getCommentMessage(body, header, previousBody),
  });
}
