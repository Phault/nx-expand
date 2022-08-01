import { context, getOctokit } from '@actions/github';
import { StickyPrCommentExecutorSchema } from './schema';
import {
  createComment,
  findPreviousComment,
  getBodyOf,
  updateComment,
} from '../../comment';

export default async function runExecutor(
  options: StickyPrCommentExecutorSchema
) {
  const { header, message, append = false } = options;
  const pullRequestNumber = context.payload.pull_request?.number;

  if (!pullRequestNumber) {
    throw new Error('No pull request found from context.');
  }

  const githubToken = process.env.GITHUB_TOKEN;

  if (!githubToken) {
    throw new Error('GITHUB_TOKEN is not available');
  }

  const octokit = getOctokit(githubToken);

  const previous = await findPreviousComment(
    octokit,
    context.repo,
    pullRequestNumber,
    header
  );

  if (!previous) {
    await createComment(
      octokit,
      context.repo,
      pullRequestNumber,
      message,
      header
    );
    return { success: true };
  }

  const previousBody = getBodyOf(previous, append, false);
  await updateComment(octokit, previous.id, message, header, previousBody);

  return {
    success: true,
  };
}
