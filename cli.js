#!/usr/bin/env node

'use strict'; // eslint-disable-line
const start = require('./lib/index.js');
const upload = require('./github');

start().then(() => {
  const args = process.argv.slice(1, process.argv.length - 1);
  args.forEach((arg) => {
    if (arg === '--upload')
      upload();
  });
});
