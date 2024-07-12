const express = require("express");
const bodyParser = require("body-parser");
const crypto = require("crypto");

const app = express();
const port = process.env.PORT || 8080;

// Your secret key
const secret =
  "sLmae4BfiIOu1ccgUTeDXHkq7pg73gH4auAMImh2DUDYQ9FyYfxJY6upf+/FtPRhjf8GyebOQg7IAQwwF3iKbQ==";

const generateRandomKey = (prefix) => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = prefix;
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const generateUniqueKey = async (prefix) => {
  let uniqueKey = null;
  while (!uniqueKey) {
    const key = generateRandomKey(prefix);
    const existingKey = await Key.findOne({ where: { key } });
    if (!existingKey) {
      uniqueKey = key;
    }
  }
  return uniqueKey;
};

// Middleware to parse raw body
app.use(bodyParser.raw({ type: "application/json" }));

app.post("/webhook", async (req, res) => {
  const headerSignature = req.headers["x-webhook-signature"];
  const payload = req.body; // Raw body

  // Log the raw payload
  console.log("Raw payload:", payload);

  // Generate our own HMAC signature from the body
  const signature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  // Convert both signatures to lowercase for comparison
  const headerSignatureLower = headerSignature.toLowerCase();
  const signatureLower = signature.toLowerCase();

  // Log the signatures for comparison
  console.log("Header Signature:", headerSignatureLower);
  console.log("Generated Signature:", signatureLower);

  // Compare the signatures
  if (
    !crypto.timingSafeEqual(
      Buffer.from(signatureLower),
      Buffer.from(headerSignatureLower, "utf-8")
    )
  ) {
    console.error("Invalid webhook request");
    return res.status(400).send("Invalid webhook request");
  }

  // If you are here, then the request was valid and you can do whatever processing you need
  console.log("Valid webhook request received");

  // Parse the payload
  let event;
  try {
    event = JSON.parse(payload.toString('utf-8'));
  } catch (error) {
    console.error("Error parsing JSON payload:", error);
    return res.status(400).send("Invalid JSON payload");
  }

  // Handle different event types
  if (event.type === "order:complete") {
    const { products, customer } = event;
    const { emailAddress } = customer;
    console.log("Processing purchase event for customer:", emailAddress);

    // Process the purchase event (e.g., generate and send keys)
    const keys = await handlePurchaseEvent(products, customer);
    console.log("Generated keys:", keys);

    return res.status(200).json({ keys });
  }

  console.log("Unhandled event type:", event.type);
  res.status(200).send("Webhook processed");
});

async function handlePurchaseEvent(products, customer) {
  try {
    let keys = [];
    for (const productObj of products) {
      const { product, quantity } = productObj;
      let duration = "LIFETIME";
      if (product.name.includes("ONE TIME")) {
        duration = "ONE TIME";
      }

      console.log(
        "Generating keys for product:",
        product.name,
        "Quantity:",
        quantity,
        "Duration:",
        duration
      );

      for (let i = 0; i < quantity; i++) {
        const key = await generateUniqueKey("iN-");
        console.log(`Key generated for ${customer.emailAddress}: ${key}`);
        keys.push(key); // Add the generated key to the keys array
      }
    }

    // Respond with the generated keys
    return keys;
  } catch (error) {
    console.error("Error handling purchase event:", error);
    return [];
  }
}

app.listen(port, () => {
  console.log(`Webhook server is listening on port ${port}`);
});
