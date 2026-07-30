#!/usr/bin/env node
import path from 'node:path';import {fileURLToPath} from 'node:url';import readline from 'node:readline/promises';import {stdin,stdout} from 'node:process';
import {loadEdition,EditionValidationError,formatErrors} from './lib/edition.mjs';import {buildArtifacts,writeArtifacts,liveLinks} from './lib/generator.mjs';import {git,isGitRepo} from './lib/git.mjs';
const repoRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),args=process.argv.slice(2),file=args.find(a=>!a.startsWith('--')),dryRun=args.includes('--dry-run'),yes=args.includes('--yes'),noPush=args.includes('--no-push'),allowUpdate=args.includes('--update');
if(!file){console.error('Usage: npm run publish-edition -- path/to/edition.json [--dry-run] [--yes] [--no-push] [--update]');process.exit(2)}
try{
  if(!isGitRepo(repoRoot))throw new Error('Publisher must run inside the The-Beacon Git repository.');
  const edition=await loadEdition(path.resolve(file)),artifacts=await buildArtifacts(edition,repoRoot,{allowUpdate});const paths=[...artifacts.files.keys()].sort();
  console.log(`\nBeacon Edition ${edition.edition}: ${edition.theme}`);console.log(`${edition.stories.length} stories · ${edition.reading_time}`);console.log(`\nPlanned file changes (${paths.length}):\n${paths.map(p=>`  ${p}`).join('\n')}`);
  if(dryRun){console.log('\n✓ Dry run complete. No files, commits, or remote branches were changed.');process.exit(0)}
  if(!yes){const rl=readline.createInterface({input:stdin,output:stdout});const answer=await rl.question(`\nType PUBLISH ${edition.edition} to create the files, commit, and push: `);rl.close();if(answer!==`PUBLISH ${edition.edition}`){console.log('Publish cancelled.');process.exit(0)}}
  await writeArtifacts(repoRoot,artifacts);git(['add','--',...paths],{cwd:repoRoot});const message=`Publish Beacon Edition ${edition.edition}: ${edition.theme}`;git(['commit','-m',message],{cwd:repoRoot,stdio:'inherit'});const sha=git(['rev-parse','HEAD'],{cwd:repoRoot});if(!noPush)git(['push','origin','main'],{cwd:repoRoot,stdio:'inherit'});
  const links=liveLinks(edition);console.log(`\n✓ Edition ${edition.edition} published.`);console.log(`Commit: ${sha}`);console.log(`Homepage: ${links.homepage}\nEdition: ${links.edition}\nArchive: ${links.archive}`);for(const a of links.articles)console.log(`Article: ${a.url}`);
}catch(e){console.error(`\nPublish failed: ${e.message}`);if(e instanceof EditionValidationError)console.error(formatErrors(e.errors));process.exit(1)}
