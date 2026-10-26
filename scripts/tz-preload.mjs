// Preloaded by `npm test` (node --import). Pins the timezone before any test
// module evaluates, so the local-day tests in dateFormat.test.js mean the same
// thing on any machine or CI runner.
process.env.TZ = 'America/Chicago';
