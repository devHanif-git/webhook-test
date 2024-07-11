const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');

const app = express();
app.use(bodyParser.json({ type: '*/*' }));

const secret = 'eAoho9vqPDG5rsHDYN5skfqzZvINvOsbB3xCOf2up7CSGtgGw7Q38XYfsdl9oewac3QHhxkkR/ncKwNHmSQ5Wg=='; // Replace with your actual secret key

app.post('/webhook', (req, res) => {
  const headerSignature = req.headers['x-webhook-signature'];
  const payload = JSON.stringify(req.body);

  // Generate HMAC signature
  const signature = crypto
    .createHmac('sha256', secret)
    .update(payload, 'utf8')
    .digest('hex');

  // Logging for debugging
  console.log('Computed hash:', signature);
  console.log('Signature from header:', headerSignature);
  console.log('Payload:', payload);
  console.log('Length of computed hash buffer:', Buffer.from(signature).length);
  console.log('Length of header signature buffer:', Buffer.from(headerSignature, 'hex').length);

  // Compare signatures
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(headerSignature, 'hex'))) {
    console.error("Invalid webhook request: signatures do not match.");
    return res.status(403).send('Forbidden');
  }

  console.log("Valid webhook request received");

  const event = req.body;

  if (event.type === 'order:complete') {
    const { products, customer } = event;

    let keys = [];
    for (let product of products) {
      let duration = 'LIFETIME';
      if (product.product.name.includes('ONE TIME')) {
        duration = 'ONE TIME';
      }

      for (let i = 0; i < product.quantity; i++) {
        const key = generateRandomKey('iN-');
        keys.push(key);
        console.log(`Key generated for ${customer.emailAddress}: ${key}`);
      }
    }

    return res.status(200).json({ keys });
  }

  res.status(200).send('Webhook received');
});

const generateRandomKey = (prefix) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = prefix;
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
