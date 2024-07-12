const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');

const app = express();
const secret = 'eAoho9vqPDG5rsHDYN5skfqzZvINvOsbB3xCOf2up7CSGtgGw7Q38XYfsdl9oewac3QHhxkkR/ncKwNHmSQ5Wg==';
const sigHeaderName = 'x-webhook-signature'|| 'X-Webhook-Signature'; 

// Middleware to capture raw body
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
  const headerSignature = req.headers[sigHeaderName]; // Get the received signature
  const payload = req.rawBody; // Get the raw body

  console.log('Payload:', payload);
  console.log('Header Signature:', headerSignature);

  const signature = crypto
    .createHmac('sha256', secret)
    .update(payload, 'utf8')
    .digest('hex'); // Generate our own HMAC signature from the raw body

  console.log('Computed hash:', signature);
  console.log('Header hash:', headerSignature);

  if (!crypto.timingSafeEqual(Buffer.from(signature, 'utf8'), Buffer.from(headerSignature, 'utf8'))) {
    console.error('Invalid webhook request: signatures do not match.');
    return res.status(401).send('Invalid webhook request');
  }

  // If you are here, then the request was valid and you can do whatever processing you need
  console.log('Valid webhook request');
  res.status(200).send('Webhook received');
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
