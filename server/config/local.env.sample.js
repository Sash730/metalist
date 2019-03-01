'use strict';

// Use local.env.js for environment variables that grunt will set when the server starts locally.
// Use for your api keys, secrets, etc. This file should not be tracked by git.
//
// You will need to set these on the server you deploy to.

module.exports = {
    DOMAIN: 'http://localhost:9000',
    SESSION_SECRET: 'metalisttickets-secret',

    FACEBOOK_ID: 'app-id',
    FACEBOOK_SECRET: 'secret',

    GOOGLE_ID: 'app-id',
    GOOGLE_SECRET: 'secret',

    // Control debug level for modules using visionmedia/debug
    DEBUG: '',

    MAILER_AUTH_USER: 'example@gmail.com',
    MAILER_AUTH_PASS: 'p@ssword',

    LIQPAY_PUBLIC_KEY: '',
    LIQPAY_PRIVATE_KEY: '',
    LIQPAY_SANDBOX_MODE: 1, // 0 or 1
};
