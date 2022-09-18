# nx-cdktf

An Nx Plugin for [CDK for Terraform](https://www.terraform.io/cdktf) containing executors, generators, and utilities for managing CDKTF applications and libraries within an Nx workspace.

## Setting up the nx-cdktf plugin

Adding the nx-cdktf plugin to an existing Nx workspace can be done with the following:

```shell
npm install -D nx-cdktf
```

## Using the nx-cdktf plugin

### Generating an application

It's straightforward to generate an nx-cdktf application:

```shell
nx g nx-cdktf:app appName
```

By default, the application will be generated with:

- TypeScript as the language
- ESLint as the linter.
- Jest as the unit test runner.

You can then deploy, destroy, synth, diff, test, and lint on the application with the following commands:

```shell
nx synth appName
nx diff appName
nx deploy appName
nx destroy appName
nx test appName
nx lint appName
```

### Running arbitrary CDKTF commands

You are not limited to invoking cdktf CLI through our executors only, you may call it directly in the context of a
project like so:

```shell
nx cdktf appName [cdktf-args]

# For example this runs `cdktf list` in your project:
nx cdktf appName list
```

Note that Nx will itself consume certain flags, such as `--version` or `--help`, but you can work around this by
adding `--` before the list of arguments intended for cdktf:

```shell
nx cdktf appName -- --help
```

## Executors

### Deploy (nx-cdktf:deploy)

Deploys the given stacks.

#### Options

| Name                               | Type     | Description                                                                                    |
| ---------------------------------- | -------- | ---------------------------------------------------------------------------------------------- |
| stacks                             | string[] | Deploy stacks matching the given ids. Required when more than one stack is present in the app. |
| autoApprove                        | boolean  | Auto approve.                                                                                  |
| outputsFile                        | string   | Path to file where stack outputs will be written as JSON, relative to cdktf.json.              |
| outputsFileIncludeSensitiveOutputs | boolean  | Whether to include sensitive outputs in the output file.                                       |
| ignoreMissingStackDependencies     | boolean  | Don't check if all stacks specified in the command have their dependencies included as well.   |
| parallelism                        | integer  | Number of concurrent CDKTF stacks to run. Defaults to infinity, denoted by -1.                 |

### Destroy (nx-cdktf:destroy)

Destroys the given stacks.

#### Options

| Name                           | Type     | Description                                                                                     |
| ------------------------------ | -------- | ----------------------------------------------------------------------------------------------- |
| stacks                         | string[] | Destroy stacks matching the given ids. Required when more than one stack is present in the app. |
| autoApprove                    | boolean  | Auto approve.                                                                                   |
| outputsFile                    | string   | Path to file where stack outputs will be written as JSON, relative to cdktf.json.               |
| ignoreMissingStackDependencies | boolean  | Don't check if all stacks specified in the command have their dependencies included as well.    |
| parallelism                    | integer  | Number of concurrent CDKTF stacks to run. Defaults to infinity, denoted by -1.                  |

### Watch (nx-cdktf:watch)

\[experimental\] Watch for file changes and automatically trigger a deploy.

#### Options

| Name        | Type     | Description                                                                                    |
| ----------- | -------- | ---------------------------------------------------------------------------------------------- |
| stacks      | string[] | Deploy stacks matching the given ids. Required when more than one stack is present in the app. |
| autoApprove | boolean  | Auto approve.                                                                                  |
| parallelism | integer  | Number of concurrent CDKTF stacks to run. Defaults to infinity, denoted by -1.                 |

### Output (nx-cdktf:output)

Prints the outputs of stacks.

#### Options

| Name                               | Type    | Description                                                                       |
| ---------------------------------- | ------- | --------------------------------------------------------------------------------- |
| outputsFile                        | string  | Path to file where stack outputs will be written as JSON, relative to cdktf.json. |
| outputsFileIncludeSensitiveOutputs | boolean | Whether to include sensitive outputs in the output file.                          |

### Synth (nx-cdktf:synth)

Synthesizes Terraform code for the application.

Corresponds to `cdktf synth`.

#### Options

Currently supports no options.

### Diff (nx-cdktf:diff)

Perform a diff (terraform plan) for the given stack.

#### Options

Currently supports no options.
