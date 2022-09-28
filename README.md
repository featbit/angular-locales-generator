<h1 align="center">
angular-locales-generator
</h1>

<div align="center">

<!--
Make New Badge Pattern badges inline
See https://github.com/all-?/all-contributors/issues/361#issuecomment-637166066
-->

[![stars](https://img.shields.io/github/stars/featbit/angular-locales-generator.svg?style=flat&logo=github&colorB=red&label=stars)](https://github.com/featbit/angular-locales-generator)
[![Node](https://img.shields.io/badge/node->=16.0-success?logo=node.js&logoColor=white)](https://www.typescriptlang.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.7-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/featbit/angular-locales-generator/build)](https://github.com/featbit/angular-locales-generator/actions/workflows/build.yml?branch=main)
</div>

This is a command line util for generating or merge, if exists already, locale file for angular project using @angular/localize package.
**Only xlf format is supported.**
# Getting Started
## Install

Use npm to install the package into your project
  ```
  npm install angular-locales-generator --save-dev
  ```

In your package.json file,  add the following command:

```json
{
  "scripts": {
    "locales-generator": "locales-generator --l zh,fr --bp ./src/locale"
  }
}
```
- **locales**: alias as **l**, the targeting locales, seperated by comma, **mandatory**
- **base-path**: alias as **bp**, the directory where the translation files are stored,  **mandatory**

## Run

```
npm run locales-generator
```

or directly without adding **scripts** in your package.json file 

```
npx locales-generator --l zh,fr --bp ./src/locale
```

Wait a while, locale files with name format **messages.[locale].xlf** should be generated under the base-path as specified above.
