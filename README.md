# firex

**firex** is CLI tool used to install ES6 modules and set up Tribefire javascript artifacts (projects)

**firex** converting js modules from node format to tribefire ES6, upload and synchronize them with Tribefire repository

## Install

`npm install @tribefire/firex -g`

## Prerequisites

To work with **firex**, ensure that you have the following:

- The Jinni Package -> [jinni](https://documentation.tribefire.com/tribefire.cortex.documentation/development-environment-doc/quick_installation_devops.html#jinni)

## Command line usage

`firex [options] [command]`

```
Options:
  -V, --version                     output the version number
  -h, --help                        display help for command

Commands:
  install|i [options] [name...]     Install package and prepare to upload
  uninstall|u [options] [names...]  Uninstall packages
  create [options] <name>           Create firex project
  init [options]                    Initialize firex project
  help [command]                    display help for command
```

### Creating a Project

To create a new project, run:

`firex create hello-word`

hello-word jsx project will be created in hello-world folder.

Use options to select different type of project eg. typescript, svelte or vue.
To install dependencies for project use -d option and provide comma separated libraries names.

You can explore all options by running:

`firex help create`

```
Usage: firex create [options] <name>

Create firex project

Options:
  -d, --deps [name]  Install dependencies (comma separated names) (default: [])
  -e --editor        Open editor
  -j --jsx           Create jsx project.
  -s --svelte        Create svelte project.
  -v --vue           Create vue project.
  -t --typescript    Create typescript project.
  -h, --help         display help for command
```

### Initialize a Project

To initialize **firex** project in existing folder, use init command. All options are the same as for create command:

```
Usage: firex init [options]

Initialize firex project

Options:
  -d, --deps <name>  Install dependencies (comma separated names) (default: [])
  -e --editor        Open editor
  -j --jsx           Create jsx project.
  -s --svelte        Create svelte project.
  -v --vue           Create vue project.
  -t --typescript    Create typescript project.
  -h, --help         display help for command
```

## Install dependencies

Use install command to add dependencies to project. Eg.:

`firex install libName1 libName2 libName3`

```
Usage: firex install|i [options] [name...]

Install package and prepare to upload

Options:
  -g, --global           Install globally
  -zp  --zip-path <dir>  Path to repository.
  -m --mvn <dir>         Use MVN structure for repository.
  -h, --help             display help for command
```

**firex** use `~/.firex/lib` for libraries installed with -g options, and `~/.firex/repository` as temporary jinni repository. You can use --zip-path option to provide different jinni repository path. If you want to prepare repository in maven format, provide path with --mvn option.

## Uninstall dependencies

Use uninstall command to remove dependencies from project. Eg.:

`firex uninstall libName1 libName2 libName3`

```
Usage: firex uninstall|u [options] [names...]

Uninstall packages

Options:
  -pom  --pom-path <dir>  Path to folder with pom.xml file. Default '.'
  -h, --help              display help for command
```
