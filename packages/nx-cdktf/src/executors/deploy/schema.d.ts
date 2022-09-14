export interface DeployExecutorSchema {
  stacks?: string[];
  autoApprove?: boolean;
  outputsFile?: string;
  outputsFileIncludeSensitiveOutputs?: boolean;
  ignoreMissingStackDependencies?: boolean;
  parallelism?: number;
}
