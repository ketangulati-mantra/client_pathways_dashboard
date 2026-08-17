import app from '../backend/dist/app.js';
import { config } from '../backend/dist/config/index.js';

const PORT = config.port || 5000;

// Minimal 1x1 transparent PNG file buffer
const SAMPLE_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);

const server = app.listen(PORT, async () => {
  console.log(`🚀 Test server running on port ${PORT}`);

  try {
    const formData = new FormData();
    const blob = new Blob([SAMPLE_PNG], { type: 'image/png' });
    formData.append('file', blob, 'test_proof_screenshot.png');
    formData.append('folder', 'provider_pathways_test');

    console.log('⚡ Sending test upload request to Cloudinary...');
    const res = await fetch(`http://localhost:${PORT}/api/uploads`, {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    console.log(`\nUpload response status: ${res.status}`);
    console.log(JSON.stringify(data, null, 2));

    if (data.success && data.data?.secure_url) {
      console.log('\n✅ Cloudinary Upload Test Passed!');
      console.log(`📷 Secure URL: ${data.data.secure_url}`);
    } else {
      console.error('\n❌ Cloudinary Upload Test Failed.');
    }

  } catch (err) {
    console.error('Test error:', err);
  } finally {
    server.close(() => {
      console.log('\n✅ Cloudinary test server closed.');
      process.exit(0);
    });
  }
});
