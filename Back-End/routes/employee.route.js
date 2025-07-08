const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employee.controller');

// CRUD routes

//login
router.post('/login', employeeController.login);

//check status
router.get('/check-status', employeeController.checkEmployeeStatus);

// lấy danh sách
router.get('/', employeeController.getAllEmployees);

//lấy theo id
router.get('/:id', employeeController.getEmployeeById);

//thêm
router.post('/', employeeController.createEmployee);

//sửa
router.put('/:id', employeeController.updateEmployee);

//chặn - bỏ chặn
router.put('/block/:id', employeeController.blockEmployee);

module.exports = router;