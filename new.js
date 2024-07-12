const fs = require('fs');
const crypto = require('crypto');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 8080;

// Read the secret from the environment or define it directly
const secret = 'eAoho9vqPDG5rsHDYN5skfqzZvINvOsbB3xCOf2up7CSGtgGw7Q38XYfsdl9oewac3QHhxkkR/ncKwNHmSQ5Wg==';

// Middleware to get the raw body
app.use(
  bodyParser.json({
    verify: (req, res, buf, encoding) => {
      if (buf && buf.length) {
        req.rawBody = buf.toString(encoding || 'utf8');
      }
    },
  })
);

app.post('/webhook', (req, res) => {
  const payload = req.rawBody.trim(); // Ensure no extra spaces
  const headerSignature = req.headers['x-webhook-signature'] || req.headers['X-Webhook-Signature'];

  console.log('Payload:', payload);

  // Compute the HMAC signature
  const signature = crypto.createHmac('sha256', secret).update(payload, 'utf8').digest('hex');

  console.log('Computed hash:', signature);
  console.log('Header hash:', headerSignature);

  // Compare the signatures
  if (signature.toLowerCase() === headerSignature.toLowerCase()) {
    console.log('Signatures match.');
    res.status(200).send('Valid webhook request');
  } else {
    console.log('Invalid webhook request: signatures do not match.');
    res.status(401).send('Invalid webhook request');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
