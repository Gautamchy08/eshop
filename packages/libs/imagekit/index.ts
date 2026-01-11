import ImageKit from '@imagekit/nodejs';

export const imageKit = new ImageKit({
  // Required: Your public key from the ImageKit dashboard
  // publicKey: process.env.IMAGEKIT_PUBLIC_KEY || '',
  
  // Required: Your private key (Keep this secret!)
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || '',
  
  // Required: Your unique URL endpoint (e.g., https://ik.imagekit.io/your_id)
  // urlEndpoint: process.env.IMAGEKIT_BASE_URL || '' 
});