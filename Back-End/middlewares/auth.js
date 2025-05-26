const jwt = require('jsonwebtoken');

const generateToken = (customer) => {
  return jwt.sign(
    {
      id_customer: customer.id_customer,
      customer_email: customer.customer_email,
      customer_name: customer.customer_name,
      customer_phone: customer.customer_phone
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '2h' }
  );
};

module.exports = generateToken;