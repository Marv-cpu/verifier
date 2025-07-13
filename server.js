// server.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

app.get('/verify-payment', async (req, res) => {
  const reference = req.query.reference;

  if (!reference) {
    return res.status(400).json({ status: 'error', message: 'Missing payment reference' });
  }

  try {
    const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
      }
    });

    const data = response.data;

    if (data.status && data.data.status === 'success') {
      return res.status(200).json({
        status: 'success',
        data: {
          reference: data.data.reference,
          amount: data.data.amount,
          email: data.data.customer.email
        }
      });
    } else {
      return res.status(400).json({ status: 'error', message: 'Payment not successful' });
    }

  } catch (error) {
    console.error('Verification failed:', error.response?.data || error.message);
    return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
