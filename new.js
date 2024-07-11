const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');

const app = express();
app.use(bodyParser.json({ type: '*/*' }));

const secret = 'eAoho9vqPDG5rsHDYN5skfqzZvINvOsbB3xCOf2up7CSGtgGw7Q38XYfsdl9oewac3QHhxkkR/ncKwNHmSQ5Wg==';

app.post('/webhook', (req, res) => {
  const headerSignature = req.headers['x-webhook-signature'];
  const payload = JSON.stringify(req.body); // Stringify the payload

  const signature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  console.log('Computed hash:', signature);
  console.log('Signature from header:', headerSignature);
  console.log('Payload:', payload);

  if (!crypto.timingSafeEqual(Buffer.from(signature, 'utf-8'), Buffer.from(headerSignature, 'utf-8'))) {
    console.error("Invalid webhook request");
    return res.status(403).send('Forbidden');
  }

  console.log("Valid webhook request received");
  res.status(200).send('Webhook received');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
