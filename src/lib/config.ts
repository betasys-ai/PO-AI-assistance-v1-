interface Config {
  aws: {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
    bucketName: string;
  };
}

export const config: Config = {
  aws: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID || '',
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || '',
    region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
    bucketName: import.meta.env.VITE_S3_BUCKET_NAME || '',
  },
};