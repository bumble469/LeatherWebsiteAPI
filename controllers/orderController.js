const instance = require('../config/razorpay');

const createOrder = async (req, res) => {
  try {
    const options = {
      amount: req.body.amount * 100,
      currency: 'INR',
      receipt: `receipt_order_${Date.now()}`
    };

    const order = await instance.orders.create(options);
    return res.status(200).json({order});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create Razorpay order' });
  }
};

const verifyPayment = async(req,res) => {
    try{
        return res.status(500).json(
            {"success":true}
        )
    }catch(err){
        console.log(err);
        res.status(500).json({ error: 'Failed to verify payment! '})
    }
}

module.exports = { createOrder, verifyPayment };
