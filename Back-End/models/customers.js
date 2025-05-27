const db = require('../config/db');
const bcrypt = require('bcryptjs');

const Customer = {

    //lấy danh sách 
    getAll: (callback) => {
        const sql = `SELECT * FROM customers`;
        db.query(sql, callback);
    },

    //lấy theo id 
    findById: (id, callback) => {
        const sql = `SELECT * FROM customers WHERE id_customer = ?`;
        db.query(sql, [id], callback);
    },

    //update thông tin khách hàng
    updateById: (id, data, callback) => {
        const sql = `
        UPDATE customers 
        SET customer_name = ?, customer_phone = ?, customer_email = ?
        WHERE id_customer = ?
        `;
        const values = [data.customer_name, data.customer_phone, data.customer_email, id];
        db.query(sql, values, callback);
    },

    //check thông tin đã có sẵn người khác trước khi update
    checkDuplicateEmailOrPhone: (email, phone, excludeCustomerId, callback) => {
        const sql = `
            SELECT * FROM customers 
            WHERE (customer_email = ? OR customer_phone = ?) 
            AND id_customer != ?
        `;
        db.query(sql, [email, phone, excludeCustomerId], callback);
    },

    //chặn khách hàng
    updateStatusById: (id, status, callback) => {
        const sql = `UPDATE customers SET customer_status = ? WHERE id_customer = ?`;
        db.query(sql, [status, id], callback);
    },

    //Đăng ký
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

    //Kiểm tra mail
    findByEmail: (email, callback) => {
        const sql = 'SELECT * FROM customers WHERE customer_email = ?';
        db.query(sql, [email], callback);
    },

    //Kiểm tra phone
    findByPhone: (phone, callback) => {
        const sql = 'SELECT * FROM customers WHERE customer_phone = ?';
        db.query(sql, [phone], callback);
    },

    //Tìm theo email hoặc phone
    findByEmailOrPhone: (identifier, callback) => {
        const sql = `SELECT * FROM customers WHERE customer_email = ? OR customer_phone = ?`;
        db.query(sql, [identifier, identifier], callback);
    },

    // cập nhật pass
    updatePassword: (identifier, hashedPassword, callback) => {
    const sql = `
        UPDATE customers 
        SET customer_password = ? 
        WHERE customer_email = ? OR customer_phone = ?
    `;
    const values = [hashedPassword, identifier, identifier];
    db.query(sql, values, callback);
    }

};

module.exports = Customer;
