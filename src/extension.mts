// Author: Igor Dimitrijević (@igorskyflyer)

import { getRepoUrlSync } from '@igor.dvlpr/git-repo-url'
import { isGitRepo } from '@igor.dvlpr/is-git-repo'
import { openSync } from '@igor.dvlpr/open-resource'
import * as vscode from 'vscode'

let statusBarItem: vscode.StatusBarItem | null = null

function goHome(cwd: string): void {
  const url: string = getRepoUrlSync({ directory: cwd })

  if (url.length > 0 && url.startsWith('http')) {
    openSync(url)
  } else {
    vscode.window.showErrorMessage('Not in a local Git repository.')
  }
}

function getCwd(): string {
  const workspaceFolders = vscode.workspace.workspaceFolders

  if (workspaceFolders && workspaceFolders.length > 0) {
    return workspaceFolders[0].uri.fsPath
  }

  return ''
}

function initStatusBar(): vscode.StatusBarItem {
  if (!statusBarItem) {
    statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100
    )
  }

  statusBarItem.command = 'gitHome.goHome'
  statusBarItem.tooltip = "Open repository's origin URL"
  statusBarItem.text = '$(repo)'

  return statusBarItem
}

export async function activate(context: vscode.ExtensionContext) {
  await vscode.commands.executeCommand('setContext', 'gitHome.isGit', false)

  const cwd: string = getCwd()

  if (typeof cwd !== 'string' || cwd.length === 0) {
    return
  }

  const isRepo: boolean = await isGitRepo({ directory: cwd })

  if (!isRepo) {
    return
  }

  await vscode.commands.executeCommand('setContext', 'gitHome.isGit', true)

  const cmdGoHome: vscode.Disposable = vscode.commands.registerCommand(
    'gitHome.goHome',
    () => goHome(cwd)
  )
  context.subscriptions.push(cmdGoHome)

  statusBarItem = initStatusBar()
  statusBarItem.show()

  context.subscriptions.push(statusBarItem)
}

export function deactivate() {
  statusBarItem?.dispose()
}
