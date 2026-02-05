/**
 * Example Service
 * 
 * This is a template for creating service classes that integrate with third-party APIs.
 * Replace this with your actual services like:
 * - payment.service.ts (Stripe, PayPal)
 * - email.service.ts (SendGrid, AWS SES)
 * - sms.service.ts (Twilio)
 * - storage.service.ts (AWS S3, Cloudinary)
 */

export class ExampleService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    // Load configuration from environment variables
    this.apiKey = process.env.EXAMPLE_API_KEY || '';
    this.baseUrl = process.env.EXAMPLE_API_URL || 'https://api.example.com';
  }

  /**
   * Example method to call external API
   */
  async callExternalAPI(data: any): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/endpoint`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('ExampleService error:', error);
      throw error;
    }
  }

  /**
   * Example method with business logic
   */
  async processData(input: string): Promise<string> {
    // Add your business logic here
    return `Processed: ${input}`;
  }
}
