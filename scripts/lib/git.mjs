import {execFileSync} from 'node:child_process';
export function git(args,{cwd,stdio='pipe'}={}){const output=execFileSync('git',args,{cwd,encoding:'utf8',stdio});return typeof output==='string'?output.trim():''}
export function isGitRepo(cwd){try{return git(['rev-parse','--is-inside-work-tree'],{cwd})==='true'}catch{return false}}
export function stagedFiles(cwd){return git(['diff','--cached','--name-only'],{cwd}).split('\n').filter(Boolean)}
export function buildRollbackPlan(sha){return {command:['revert','--no-edit',sha],message:`Revert publication commit ${sha}`}}
