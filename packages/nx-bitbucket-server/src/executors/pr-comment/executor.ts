import { PrCommentExecutorSchema } from './schema';
import {
  createComment,
  findPreviousComment,
  updateComment,
} from '../../comment';
import { Executor, logger } from '@nrwl/devkit';
import { readFile } from 'node:fs/promises';
import { renderString } from '@nx-expand/utilities';
import path = require('node:path');
import { BitbucketServer } from '../../bitbucketServer';
import { getPluginConfig } from '../../utils/plugin-config';

const runExecutor: Executor<PrCommentExecutorSchema> = async (
  options,
  context
) => {
  const { message, sticky } = options;
  const { projectKey, repositorySlug, baseUrl } = getPluginConfig(
    context.workspace
  );
  const prNumber =
    typeof options.prNumber === 'string'
      ? Number.parseInt(options.prNumber)
      : options.prNumber;

  if (!prNumber) {
    logger.info(`'prNumber' wasn't provided, skipping creation of comment.`);

    return {
      success: true,
    };
  }

  if (!process.env.BITBUCKET_SERVER_TOKEN) {
    throw new Error('BITBUCKET_SERVER_TOKEN is not available');
  }

  const apiClient = new BitbucketServer({
    baseUrl,
    auth: process.env.BITBUCKET_SERVER_TOKEN,
  });

  const messageBody = renderString(
    message.type === 'inline'
      ? message.content
      : await readFile(path.resolve(context.root, message.content), {
          encoding: 'utf-8',
        }),
    {
      ...message.variables,
      env: process.env,
    }
  );

  const previousComment = sticky
    ? await findPreviousComment(
        apiClient,
        projectKey,
        repositorySlug,
        prNumber,
        sticky.header
      )
    : null;

  if (previousComment && sticky) {
    logger.debug('Found existing sticky comment');

    if (sticky.action === 'recreate') {
      logger.debug('Deleting existing comment');
      await apiClient.deletePullRequestComment({
        projectKey,
        repositorySlug,
        pullRequestId: prNumber,
        commentId: previousComment.id,
        version: previousComment.version,
      });
    } else if (sticky.action === 'update') {
      logger.debug('Updating existing comment');

      await updateComment(
        apiClient,
        projectKey,
        repositorySlug,
        prNumber,
        previousComment.id,
        previousComment.version,
        messageBody,
        sticky.header,
        sticky.append ? previousComment?.text : undefined
      );

      return { success: true };
    }
  }

  await createComment(
    apiClient,
    projectKey,
    repositorySlug,
    prNumber,
    messageBody,
    sticky?.header,
    sticky?.append ? previousComment?.text : undefined
  );

  return {
    success: true,
  };
};

export default runExecutor;
