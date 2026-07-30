#!/usr/bin/env node
import path from 'node:path';import {fileURLToPath} from 'node:url';
import {loadEdition,EditionValidationError,formatErrors} from './lib/edition.mjs';import {buildArtifacts,writeArtifacts} from './lib/generator.mjs';
const repoRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),args=process.argv.slice(2),file=args.find(a=>!a.startsWith('--'));if(!file){console.error('Usage: npm run generate -- path/to/edition.json [--update]');process.exit(2)}
try{const edition=await loadEdition(path.resolve(file)),artifacts=await buildArtifacts(edition,repoRoot,{allowUpdate:args.includes('--update')});await writeArtifacts(repoRoot,artifacts);console.log(`✓ Generated ${artifacts.files.size} files for Edition ${edition.edition}.`)}catch(e){console.error(e.message);if(e instanceof EditionValidationError)console.error(formatErrors(e.errors));process.exit(1)}
