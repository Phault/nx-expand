export interface DestroyExecutorSchema {
  stacks?: string[];
  autoApprove?: boolean;
  ignoreMissingStackDependencies?: boolean;
  parallelism?: number;
}
