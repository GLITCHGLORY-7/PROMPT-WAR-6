/**
 * AeroPulse AI — Production Application Entrypoint & Root Serverless Handler
 * 
 * Serves as the primary entrypoint for Vercel Serverless Function deployment,
 * forwarding incoming HTTP requests to the unified AeroPulse server instance
 * with multi-directory static resolution and zero-trust security headers.
 *
 * @param {import('node:http').IncomingMessage} req - Incoming HTTP request stream.
 * @param {import('node:http').ServerResponse} res - Server HTTP response stream.
 * @returns {void}
 */

'use strict';

import server from './server.js';

export default server;
