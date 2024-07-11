require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto'); // Import the crypto lib

const app = express();
app.use(bodyParser.json());

const secret = process.env.WEBHOOK_SECRET || 'eAoho9vqPDG5rsHDYN5skfqzZvINvOsbB3xCOf2up7CSGtgGw7Q38XYfsdl9oewac3QHhxkkR/ncKwNHmSQ5Wg=='; // Enter your secret key

app.post('/webhook', (req, res) => {
  const headerSignature = req.headers['x-webhook-signature']; // Get the received signature
  const payload = JSON.stringify(req.body); // Get the request body as a string

  // Generate our own HMAC signature from the body
  const signature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('base64'); // Use 'base64' to match the format of the provided signature

  console.log('Computed hash:', signature);
  console.log('Signature from header:', headerSignature);
  console.log('Payload:', payload);

  // Ensure the headerSignature is in the correct format
  const headerSignatureBuffer = Buffer.from(headerSignature, 'base64');
  const signatureBuffer = Buffer.from(signature, 'base64');

  // Log the lengths of both buffers
  console.log('Length of computed hash buffer:', signatureBuffer.length);
  console.log('Length of header signature buffer:', headerSignatureBuffer.length);

  // Compare signatures
  if (signatureBuffer.length !== headerSignatureBuffer.length || !crypto.timingSafeEqual(signatureBuffer, headerSignatureBuffer)) {
    console.error('Invalid webhook request: signatures do not match.');
    return res.status(403).send('Forbidden');
  }

  // If you are here, then the request was valid and you can do whatever processing you need
  console.log("Valid webhook request received");

  // Process the event (dummy processing for this example)
  const event = req.body;
  if (event.type === 'purchase.created') {
    const { product, quantity, buyer } = event.data;
    console.log('Processing purchase event:', product, quantity, buyer);
    // You can add further processing logic here...
  }

  res.status(200).send('Webhook received');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
