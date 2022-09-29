const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const bookController = require('../controllers/bookController')
const { authentication, authorization } = require('../middlewares/auth');
const { createReview, updateReview, deleteReview } = require("../controllers/reviewController");
const awsController = require("../controllers/awsController")


router.post("/login", userController.userLogin)
router.post("/register", userController.createUser);


router.post('/books', authentication, bookController.createBook)
router.get('/books', authentication, bookController.getBooks)
router.get('/books/:bookId', authentication, bookController.getBookById)
router.put('/books/:bookId', authentication, authorization, bookController.updateBook)
router.delete('/books/:bookId', authentication, authorization, bookController.deleteById)


router.post("/books/:bookId/review", createReview);
router.put("/books/:bookId/review/:reviewId", updateReview);
router.delete("/books/:bookId/review/:reviewId", deleteReview);

router.post("/write-file-aws",awsController.awsLink)

module.exports = router;