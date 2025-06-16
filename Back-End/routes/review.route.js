const express = require('express');
const router = express.Router()
const ReviewController = require ('../controllers/comment.controller');

router.post('/', ReviewController.postReview);

router.get('/:id', ReviewController.getReviewById);

router.get('/', ReviewController.getAllReviews);

router.put('/:id/approve', ReviewController.reviewApprove);

module.exports = router;