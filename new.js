const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');

// Set up the Express app and middleware
const app = express();
app.use(bodyParser.json({ type: '*/*' }));

// Define your secret key
const secret = 'eAoho9vqPDG5rsHDYN5skfqzZvINvOsbB3xCOf2up7CSGtgGw7Q38XYfsdl9oewac3QHhxkkR/ncKwNHmSQ5Wg==';

// Helper function to generate a unique key
const generateRandomKey = (prefix) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = prefix;
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Webhook endpoint
app.post('/webhook', async (req, res) => {
  const headerSignature = req.headers['x-webhook-signature'];
  const payload = JSON.stringify(req.body);

  const signature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  console.log('Computed hash:', signature);
  console.log('Signature from header:', headerSignature);
  console.log('Payload:', payload);

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(headerSignature, 'utf-8'))) {
    console.error("Invalid webhook request: signatures do not match.");
    return res.status(403).send('Forbidden');
  }

  console.log("Valid webhook request received");

  const event = req.body;

  if (event.type === 'order:complete') {
    const { products, buyer } = event;

    let keys = [];
    for (let product of products) {
      let duration = 'LIFETIME';
      if (product.product.name.includes('ONE TIME')) {
        duration = 'ONE TIME';
      }

      for (let i = 0; i < product.quantity; i++) {
        const key = generateRandomKey('iN-');
        keys.push(key);
        console.log(`Key generated for ${buyer.email}: ${key}`);
      }
    }

    return res.status(200).json({ keys });
  }

  res.status(200).send('Webhook received');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
