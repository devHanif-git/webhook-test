const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');

const app = express();
const port = process.env.PORT || 8080;

// Your secret key
const secret = 'sLmae4BfiIOu1ccgUTeDXHkq7pg73gH4auAMImh2DUDYQ9FyYfxJY6upf+/FtPRhjf8GyebOQg7IAQwwF3iKbQ==';

// Middleware to parse raw body
app.use(bodyParser.raw({ type: 'application/json' }));

app.post('/webhook', (req, res) => {
    const headerSignature = req.headers['x-webhook-signature'];
    const payload = req.body; // Raw body

    // Log the raw payload
    console.log('Raw payload:', payload);

    // Generate our own HMAC signature from the body
    const signature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');

    // Convert both signatures to lowercase for comparison
    const headerSignatureLower = headerSignature.toLowerCase();
    const signatureLower = signature.toLowerCase();

    // Log the signatures for comparison
    console.log('Header Signature:', headerSignatureLower);
    console.log('Generated Signature:', signatureLower);

    // Compare the signatures
    if (!crypto.timingSafeEqual(Buffer.from(signatureLower), Buffer.from(headerSignatureLower, 'utf-8'))) {
        console.error("Invalid webhook request");
        return res.status(400).send('Invalid webhook request');
    }

    // If you are here, then the request was valid and you can do whatever processing you need
    console.log("Valid webhook request received");
    // Process the payload here

    res.status(200).send('Webhook processed');
});

app.listen(port, () => {
    console.log(`Webhook server is listening on port ${port}`);
});
