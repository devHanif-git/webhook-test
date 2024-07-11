const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto'); // Import the crypto lib

const app = express();
app.use(bodyParser.json());

const secret = 'eAoho9vqPDG5rsHDYN5skfqzZvINvOsbB3xCOf2up7CSGtgGw7Q38XYfsdl9oewac3QHhxkkR/ncKwNHmSQ5Wg=='; // Enter your secret key between the quotes

app.post('/webhook', (req, res) => {
  const headerSignature = req.headers['x-webhook-signature']; // Get the received signature
  const payload = JSON.stringify(req.body); // Get the request body as a string

  // Generate our own HMAC signature from the body
  const signature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex'); 

  console.log('Computed hash:', signature);
  console.log('Signature from header:', headerSignature);
  console.log('Payload:', payload);

  // Compare, if fail refuse the request
  if (!crypto.timingSafeEqual(Buffer.from(signature, 'utf-8'), Buffer.from(headerSignature, 'utf-8'))) {
    console.error("Invalid webhook request");
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
