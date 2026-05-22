import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      'aws-cdk-lib': path.resolve(__dirname, 'node_modules/aws-cdk-lib'),
      'aws-cdk-lib/assertions': path.resolve(__dirname, 'node_modules/aws-cdk-lib/assertions'),
      'constructs': path.resolve(__dirname, 'node_modules/constructs'),
    },
  },
  test: {
    include: ['../tests/unit/**/*.test.ts'],
    server: {
      deps: {
        external: [/aws-cdk-lib/],
      },
    },
  },
});
