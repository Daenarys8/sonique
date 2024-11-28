# Configuration Update Required

To resolve the AWS credentials error, you need to:

1. Copy the `.env` file to `.env.local` (which is git-ignored)
2. Update the AWS credentials in `.env.local`:
   ```
   VITE_AWS_ACCESS_KEY_ID=your_actual_access_key
   VITE_AWS_SECRET_ACCESS_KEY=your_actual_secret_key
   ```

The application will use these credentials for AWS services including Bedrock puzzle generation.

Note: Keep your actual AWS credentials secure and never commit them to version control.