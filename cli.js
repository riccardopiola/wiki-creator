#!/usr/bin/env node

'use strict'; // eslint-disable-line
const start = require('./lib/index.js');
const upload = require('./github');

start().then(() => {
  process.argv.forEach(async (arg) => {
    if (arg === '--upload')
      await upload();
  });
});
