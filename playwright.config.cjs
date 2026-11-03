const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.cjs',
  use: { baseURL: 'http://127.0.0.1:5181', browserName: 'chromium' },
  webServer: {
    command: 'python3 -m http.server 5181 --bind 127.0.0.1',
    url: 'http://127.0.0.1:5181',
    reuseExistingServer: !process.env.CI,
    stdout: 'ignore',
    stderr: 'ignore',
  },
});
