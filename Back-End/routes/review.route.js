const express = require('express');
const router = express.Router()
const ReviewController = require ('../controllers/comment.controller');

//get review by id guest
router.get('/customer/:id', ReviewController.getReviewsByCustomer);

//get review by id product
router.get('/product/:id', ReviewController.getReviewsByProduct);

//post review with condition
router.post('/', ReviewController.postReview);

//get review by id guest and customer
router.get('/:id', ReviewController.getReviewById);

//get all review for admin
router.get('/', ReviewController.getAllReviews);

//approve the review
router.put('/:id/approve', ReviewController.reviewApprove);

module.exports = router;