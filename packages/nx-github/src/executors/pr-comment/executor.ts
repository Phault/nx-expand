import { context as githubContext, getOctokit } from '@actions/github';
import { PrCommentExecutorSchema } from './schema';
import {
  createComment,
  deleteComment,
  findPreviousComment,
  minimizeComment,
  updateComment,
} from '../../comment';
import { Executor, logger } from '@nrwl/devkit';
import { readFile } from 'node:fs/promises';

const runExecutor: Executor<PrCommentExecutorSchema> = async (options) => {
  const {
    prNumber = githubContext.payload.pull_request?.number,
    message,
    sticky,
  } = options;

  if (!prNumber) {
    logger.info(
      `'prNumber' wasn't provided and could not extract from CI context, skipping creation of comment.`
    );

    return {
      success: true,
    };
  }

  const githubToken = process.env.GITHUB_TOKEN;

  if (!githubToken) {
    throw new Error('GITHUB_TOKEN is not available');
  }

  const octokit = getOctokit(githubToken);

  const messageBody =
    message.type === 'inline'
      ? message.content
      : await readFile(message.content, { encoding: 'utf-8' });

  const previousComment = sticky
    ? await findPreviousComment(
        octokit,
        githubContext.repo,
        prNumber,
        sticky.header
      )
    : null;

  if (previousComment && sticky) {
    logger.debug('Found existing sticky comment');

    if (sticky.action === 'recreate') {
      logger.debug('Deleting existing comment');
      await deleteComment(octokit, previousComment.id);
    } else if (sticky.action === 'hide-previous') {
      logger.debug('Hiding existing comment');
      await minimizeComment(octokit, previousComment.id, 'OUTDATED');
    } else if (sticky.action === 'update') {
      logger.debug('Updating existing comment');

      await updateComment(
        octokit,
        previousComment?.id,
        messageBody,
        sticky.header,
        sticky.append ? previousComment?.body : undefined
      );

      return { success: true };
    }
  }

  await createComment(
    octokit,
    githubContext.repo,
    prNumber,
    messageBody,
    sticky?.header,
    sticky?.append ? previousComment?.body : undefined
  );

  return {
    success: true,
  };
};

export default runExecutor;
