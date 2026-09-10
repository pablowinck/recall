// @ts-check
import express from 'express';
import application from './dist/server.js';

// The Vercel entrypoint uses the same compiled application as Docker.
export default express().disable('x-powered-by').use(application);
