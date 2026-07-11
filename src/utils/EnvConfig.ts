import dotenv from 'dotenv';
import path from 'path';
import { LoginConfig } from 'src/types/LoginConfig';

export class EnvConfig implements LoginConfig {
  public readonly email: string;
  public readonly password: string;
  public readonly baseUrl: string;

  constructor() {
    // Load the .env file from the root directory
    dotenv.config({ path: path.resolve(process.cwd(), '.env') });

    // Validate variables and extract clean error reporting
    this.email = this.validateAndGet('TEST_EMAIL', 'Please provide a valid test user email address.');
    this.password = this.validateAndGet('TEST_PASSWORD', 'Please provide the password matching your test account.');
    this.baseUrl = this.validateAndGet('TEST_BASE_URL', 'Please provide the target website URL.');
  }

  /**
   * Helper method to validate the environment variable exists and is not empty.
   */
  private validateAndGet(key: string, userFriendlyMessage: string): string {
    const value = process.env[key];

    if (!value || value.trim() === '') {
      throw new Error(
        `\n[Configuration Error]: Missing environment variable "${key}"\n` +
        `👉 Action Required: ${userFriendlyMessage}\n` +
        `📍 Checkpoint: Verify that "${key}" is correctly defined in your local .env file.\n`
      );
    }

    return value;
  }
}