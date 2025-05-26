const db = require('../config/db');
const bcrypt = require('bcryptjs');

const Customer = {
    create: async (data, callback) => {
        try {
            const hashedPassword = await bcrypt.hash(data.customer_password, 10);
            const sql = `INSERT INTO customers (customer_name, customer_phone, customer_email, customer_password) VALUES (?, ?, ?, ?)`;
            const values = [data.customer_name, data.customer_phone, data.customer_email, hashedPassword];
            db.query(sql, values, callback);
        } catch (err) {
            callback(err);
        }
    },

    findByEmail: (email, callback) => {
        const sql = 'SELECT * FROM customers WHERE customer_email = ?';
        db.query(sql, [email], callback);
    },

    findByPhone: (phone, callback) => {
        const sql = 'SELECT * FROM customers WHERE customer_phone = ?';
        db.query(sql, [phone], callback);
    },

    findByEmailOrPhone: (identifier, callback) => {
        const sql = `SELECT * FROM customers WHERE customer_email = ? OR customer_phone = ?`;
        db.query(sql, [identifier, identifier], callback);
    },

    updatePassword: async (identifier, newPassword, callback) => {
        try {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            const sql = `
                UPDATE customers 
                SET customer_password = ? 
                WHERE customer_email = ? OR customer_phone = ?
            `;
            const values = [hashedPassword, identifier, identifier];
            db.query(sql, values, callback);
        } catch (err) {
            callback(err);
        }
    }
};

module.exports = Customer;
