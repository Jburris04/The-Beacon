#!/usr/bin/env node
import path from 'node:path';
import {loadEdition,EditionValidationError,formatErrors} from './lib/edition.mjs';
const file=process.argv[2];if(!file){console.error('Usage: npm run validate-edition -- path/to/edition.json');process.exit(2)}
try{const edition=await loadEdition(path.resolve(file));console.log(`✓ Edition ${edition.edition} is valid (${edition.stories.length} stories).`)}catch(e){console.error(e.message);if(e instanceof EditionValidationError)console.error(formatErrors(e.errors));process.exit(1)}
