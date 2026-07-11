import { FullConfig } from '@playwright/test';
import { EnvConfig } from 'src/utils/EnvConfig';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Validating test environment configuration...');
  try {
    // This immediately triggers the constructor validation and throws if missing
    new EnvConfig();
    console.log('✅ Environment configuration validated successfully.');
  } catch (error) {
    // Catch and rethrow to instantly halt the test suite execution
    throw error;
  }
}

export default globalSetup;