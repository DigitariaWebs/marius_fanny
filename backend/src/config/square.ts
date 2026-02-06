/**
 * Square Payment Configuration
 * 
 * Setup Instructions:
 * 1. Create a Square Developer Account at https://developer.squareup.com/
 * 2. Create an application in the Square Dashboard
 * 3. Get your credentials from the Square Dashboard:
 *    - Application ID (for frontend)
 *    - Location ID (for payments)
 *    - Access Token (for backend API calls)
 * 4. Add these to your .env file:
 *    SQUARE_ACCESS_TOKEN=your_access_token
 *    SQUARE_LOCATION_ID=your_location_id
 *    SQUARE_APPLICATION_ID=your_application_id
 *    SQUARE_ENVIRONMENT=sandbox (or production)
 */

import { SquareClient, SquareEnvironment } from "square";

const squareEnvironment =
  process.env.SQUARE_ENVIRONMENT === "production"
    ? SquareEnvironment.Production
    : SquareEnvironment.Sandbox;

// Label for logging purposes
const squareEnvironmentLabel =
  process.env.SQUARE_ENVIRONMENT === "production" ? "production" : "sandbox";

// Initialize Square client with access token
const squareClient = new SquareClient({
  token: process.env.SQUARE_ACCESS_TOKEN,
  environment: squareEnvironment,
});

// Square configuration
export const squareConfig = {
  locationId: process.env.SQUARE_LOCATION_ID || "",
  applicationId: process.env.SQUARE_APPLICATION_ID || "",
  environment: squareEnvironmentLabel,
};

// Validate Square configuration on startup
export const validateSquareConfig = () => {
  const requiredVars = [
    "SQUARE_ACCESS_TOKEN",
    "SQUARE_LOCATION_ID",
    "SQUARE_APPLICATION_ID",
  ];

  const missing = requiredVars.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.warn(
      `⚠️  Missing Square environment variables: ${missing.join(", ")}`,
    );
    console.warn("Square payment functionality may not work properly.");
    return false;
  }

  console.log(`✓ Square configured for ${squareEnvironment} environment`);
  return true;
};

export default squareClient;
