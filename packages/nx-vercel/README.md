# nx-vercel

Nx plugin for integrating with the Vercel CLI, while working around the quirks it has when working with monorepos.

## Motivation

Vercel is great, and while they support monorepos, that support is unfortunately lacking on certain fronts. As per their own [FAQ for monorepos](https://vercel.com/blog/monorepos#faq):

> **How can I use monorepos with Vercel CLI?**
>
> Because Vercel CLI only allows for linking a single Vercel project, you currently need to clone your Git repository multiple times (once per directory you want to deploy or develop) and then link a project for each.

If you have multiple apps in your monorepo that you need to deploy with Vercel, then it should be obvious why this is a terrible developer experience.

There's also several reasons why you might not want or is unable to use their Git integration:

- Your Git server is private or Vercel does not yet provide integration with your Git provider.
- You're using a private npm registry, which the Vercel build server cannot connect to.
- You have an existing CI/CD pipeline and you want to deploy the version you already built & tested.
- You don't want to share your source code with Vercel.

The last three reasons listed will also make you unable to use `vercel deploy` out of the box, but fortunately Vercel CLI now has support for building locally and then deploying the result using `vercel build` and `vercel deploy --prebuilt`.

If you do not use their Git integration then you need to use Vercel CLI\* with your own CI/CD pipeline, and if you use Vercel CLI in a monorepo then you can only link a single project at a time. I have no doubt Vercel will improve this situation, but for now we either suffer or have to work around it.

<sub>\*) Technically there's nothing stopping you from using the low-level @vercel/client to build your own integration with Vercel if you _really_ wanted to.</sub>

## Executors

All executors require you to have signed in using the Vercel CLI before usage. Alternatively you can set the `VERCEL_TOKEN` environment variable to a valid [authorization token](https://vercel.com/account/tokens) and it will be passed along to Vercel CLI.

### Pull

Ensures your project is linked, pulls the project config and environment variables from Vercel for the given environment.

If your build relies on the environment variables, it's a good idea to make this executor run first, either manually or by adding it to your build task's dependencies.

Corresponds to `vercel link`, `vercel pull` and `vercel env pull`.

#### Options

| Name          | Type    | Description                                                                                                                                    |
| ------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| projectId\*   | string  | Can be found in your project settings on Vercel.                                                                                               |
| orgId\*       | string  | Also known as "team id" or "user id". Can be found in your user/team settings on Vercel.                                                       |
| outputEnvFile | string  | If defined then the environment variables for the given environment will be written to the specified file relative to `project.json`'s `root`. |
| debug         | boolean | Increases logging verbosity (default `false`)                                                                                                  |

#### Example

```json
// project.json

"pull": {
    "executor": "nx-vercel:pull",
    "defaultConfiguration": "development",
    "options": {
        "projectId": "prj_aOla8ft3akHJansdsi3jIoxH",
        "orgId": "team_gedDkd7kJdt9buHTHDzAaBc",
    },
    "configurations": {
        "development": {
            "environment": "development",
            "outputEnvFile": ".env.development.local"
        },
        "preview": {
            "environment": "preview",
            "outputEnvFile": ".env.production.local"
        },
        "production": {
            "environment": "production",
            "outputEnvFile": ".env.production.local"
        }
    }
},
"build": {
    "dependsOn": [{ "projects": "self", "target": "pull" }]
    // etc ...
}
```

### Deploy prebuilt

> **Caution**: Due to limitations in Vercel CLI and how we work around them, this executor should not run in parallel on the same machine.

Deploys an already built app to Vercel.

Since the `.vercel` folder will temporarily be moved to the workspace root during deployment, the paths defined in your project settings should be relative to the root.

<!-- Trick for skipping the install and build step -->
<!-- You will need to tweak your project settings on Vercel to disable the `install` and `build` step, _but_ they should not be empty as this will make Vercel CLI assume it's a completely static site. To work around this set the commands to `true`. `Root directory` should be path to your app's dist folder. `Output directory` is relative to `Root directory` and should contain the location of the `.next` folder.

In short, your project settings should look something like this:

- Build command: "true"
- Output directory: ".next"
- Install command: "true"
- Root directory: "dist/apps/my-app" -->

Corresponds to `vercel build` and `vercel deploy --prebuilt`.

#### Options

| Name        | Type    | Description                                                                                       |
| ----------- | ------- | ------------------------------------------------------------------------------------------------- |
| buildPath\* | string  | The output path of the build task relative to the workspace root.                                 |
| prod        | boolean | Whether to create a production deployment (true) or preview deployment (false). (default `false`) |
| debug       | boolean | Increases logging verbosity (default `false`)                                                     |

#### Example

```json
// project.json

"pull": {
    "executor": "nx-vercel:pull",
    // etc...
},
"build": {
    "dependsOn": [{ "projects": "self", "target": "pull" }],
    // etc...
},
"deploy": {
    "dependsOn": [{ "projects": "self", "target": "pull" }],
    "executor": "nx-vercel:deploy-prebuilt",
    "options": {
        "buildPath": "dist/apps/my-app",
    },
    "configurations": {
        "preview": {},
        "production": {
            "prod": true
        }
    }
}
```

## Plugin config

The plugin can be configured to use a different command for invoking the Vercel CLI than the default `vercel` command. This is useful as Vercel CLI doesn't respect proxy environment variables, but can be forced to do so using a wrapper like [proxify-vercel](https://www.npmjs.com/package/proxify-vercel).

```diff
// nx.json

{
---
 "pluginsConfig": {
+    "nx-vercel": {
+      "vercelCommand": "npx proxify-vercel"
+    }
  }
}
```

## Building

Run `nx build nx-vercel` to build the library.

## Running unit tests

Run `nx test nx-vercel` to execute the unit tests via [Jest](https://jestjs.io).
