// src/services/aws/mediaService.js
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from './config';

export const mediaService = {
    async getMediaUrl(key) {
        const command = new GetObjectCommand({
            Bucket: process.env.REACT_APP_S3_BUCKET,
            Key: key
        });

        // Generate presigned URL that expires in 1 hour
        const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
        return url;
    }
};
