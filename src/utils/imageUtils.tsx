// Utility functions for handling image uploads and Quill deltas

// Upload a base64 image to the server and return the URL
export const uploadImage = async (base64Data: string): Promise<string> => {
  try {
    const response = await fetch('https://localhost:5001/api/upload-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64Data }),
    });
    const result = await response.json();
    return result.url; // e.g., "https://yourserver.com/images/123.png"
  } catch (error) {
    console.error('Image upload failed:', error);
    return base64Data; // Fallback to original base64 on error
  }
};

// Process a Quill delta to upload base64 images and replace with server URLs
export const processDeltaForImages = async (delta: any): Promise<any[]> => {
  const newOps = await Promise.all(delta.ops.map(async (op: any) => {
    if (op.insert && op.insert.image && typeof op.insert.image === 'string' && op.insert.image.startsWith('data:image/')) {
      // Base64 image detected
      try {
        const imageUrl = await uploadImage(op.insert.image);
        return { ...op, insert: { image: imageUrl } }; // Replace with server URL
      } catch (error) {
        console.error('Error uploading image:', error);
        return op; // Return original op on error
      }
    }
    return op; // No change for other ops
  }));
  return newOps;
};