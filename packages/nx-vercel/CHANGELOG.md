# Changelog

This file was generated using [@jscutlery/semver](https://github.com/jscutlery/semver).

## [0.1.5](https://github.com/Phault/nx-expand/compare/nx-vercel-0.1.4...nx-vercel-0.1.5) (2023-06-10)


### Bug Fixes

* **nx-vercel:** treat empty strings as `null` for the Vercel project settings that support it ([01888da](https://github.com/Phault/nx-expand/commit/01888da496a3995d267835058f07fa59d2df01cb))

## [0.1.4](https://github.com/Phault/nx-expand/compare/nx-vercel-0.1.3...nx-vercel-0.1.4) (2023-06-01)

## [0.1.3](https://github.com/Phault/nx-expand/compare/nx-vercel-0.1.2...nx-vercel-0.1.3) (2023-06-01)


### Bug Fixes

* **nx-github,nx-bitbucket-server,nx-vercel:** add missing exports ([3f14a34](https://github.com/Phault/nx-expand/commit/3f14a34223157f1302fff0a8ec3a2685d8ac170e))

## [0.1.2](https://github.com/Phault/nx-expand/compare/nx-vercel-0.1.1...nx-vercel-0.1.2) (2023-06-01)

### Dependency Updates

* `utilities` updated to version `0.0.5`
## [0.1.1](https://github.com/Phault/nx-expand/compare/nx-vercel-0.1.0...nx-vercel-0.1.1) (2023-06-01)

## [0.1.0](https://github.com/Phault/nx-expand/compare/nx-vercel-0.0.4...nx-vercel-0.1.0) (2023-06-01)

### Dependency Updates

* `utilities` updated to version `0.0.4`

### Features

* **nx-vercel:** allow overriding vercel project settings ([afde3c9](https://github.com/Phault/nx-expand/commit/afde3c99c52c9b3273861f5f4b18533ded71d738))

## [0.0.4](https://github.com/Phault/nx-expand/compare/nx-vercel-0.0.3...nx-vercel-0.0.4) (2022-09-03)

## [0.0.3](https://github.com/Phault/nx-expand/compare/nx-vercel-0.0.2...nx-vercel-0.0.3) (2022-09-03)

### Dependency Updates

* `utilities` updated to version `0.0.3`

### Bug Fixes

* **nx-vercel,nx-bitbucket-server:** read nx.json manually instead of relying on executor context ([57b36b4](https://github.com/Phault/nx-expand/commit/57b36b4d7c2f4c19ed88b4e9f0b57a67169dbdae))

## [0.0.2](https://github.com/Phault/nx-expand/compare/nx-vercel-0.0.1...nx-vercel-0.0.2) (2022-08-09)

### Dependency Updates

* `utilities` updated to version `0.0.2`
## [0.0.1](https://github.com/Phault/nx-expand/compare/nx-vercel-0.0.1-alpha.1...nx-vercel-0.0.1) (2022-08-07)

### Dependency Updates

* `utilities` updated to version `0.0.1`
## [0.0.1-alpha.1](https://github.com/Phault/nx-expand/compare/nx-vercel-0.0.1-alpha.0...nx-vercel-0.0.1-alpha.1) (2022-08-07)

## 0.0.1-alpha.0 (2022-08-07)


### Features

* **nx-vercel,nx-github,utilities:** rework parameter expansion and post-targets ([233d22d](https://github.com/Phault/nx-expand/commit/233d22df6cb2342c6c126fe5dba9bb026c91aea3))
* **nx-vercel:** add post-targets option for running executors after deployment ([b894a45](https://github.com/Phault/nx-expand/commit/b894a457a8861662ce7f3b22ab99b1da020ced8b))
* **nx-vercel:** expose executor context for parameter expansion ([ccd3b07](https://github.com/Phault/nx-expand/commit/ccd3b07b2b78bfa98026139a5d412f59707fc50d))
* **nx-vercel:** generate plugin ([1523aad](https://github.com/Phault/nx-expand/commit/1523aadbcd13d902b5826b4d55fa5108e87394d7))
* **nx-vercel:** import initial implementation with `pull` and `deploy-prebuilt` executors ([6814f21](https://github.com/Phault/nx-expand/commit/6814f21d105983f884c1bc561c553c6d7317e2dc))
* **nx-vercel:** reduce configuration required ([d9b66ec](https://github.com/Phault/nx-expand/commit/d9b66ec73ee81b86de1965fd31cce441a2afb4e2))


### Bug Fixes

* **nx-vercel,nx-bitbucket-server:** plugin-config schema and module cannot have the same name ([2032ff0](https://github.com/Phault/nx-expand/commit/2032ff0eb2096c7a1862eee426dc98df2f07dce9))
* **nx-vercel:** add `--prod` flag to `vercel build` as well ([d9d8af4](https://github.com/Phault/nx-expand/commit/d9d8af4aa4d8b63d8fe013e3e4b255655714d6f5))
* **nx-vercel:** always run commands from root and rely on Vercel CLI `--cwd` parameter instead ([5a72ce2](https://github.com/Phault/nx-expand/commit/5a72ce2cbc3bfd218187bde53f8d50a8f5412b14))
* **nx-vercel:** copy the env file instead of symlinking it, to work better with caching ([3808e70](https://github.com/Phault/nx-expand/commit/3808e70bdaab8da176bfb49a89354013a988ab70))
* **nx-vercel:** enable TS strict mode ([ef86af2](https://github.com/Phault/nx-expand/commit/ef86af2043bac5715425138908c7ed585d553749))
* **nx-vercel:** envFile symlink creation was not awaited and thus didn't get created in time ([0cc5b2c](https://github.com/Phault/nx-expand/commit/0cc5b2c832af02a4cd057cd705da56b72806cd8c))
* **nx-vercel:** forgot to rename deploy to deploy-prebuilt in the most important place of all ([5e666ca](https://github.com/Phault/nx-expand/commit/5e666ca8a74907f6be9bd1d21b6ac571f92870e5))
* **nx-vercel:** skip verifying the contents of the just created project.json ([b7f8d7a](https://github.com/Phault/nx-expand/commit/b7f8d7a022da1a32af51275efa88c7083d2ac2d8))
* **nx-vercel:** use junction for linking .vercel on Windows ([1d01c5a](https://github.com/Phault/nx-expand/commit/1d01c5ab8a3465fd84310bc17edf81700d09942e))
