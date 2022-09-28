const bookModel = require("../models/bookModel");
const reviewModel = require("../models/reviewModel");
const { validateObjectId, ConversionToProperName, validateName, stringChecking, validDate } = require("../validators/validator");
const moment = require("moment");
const today = moment();


const createReview = async function (req, res) {
    try {
        const bookPId = req.params.bookId;
        const reviewDetails = req.body;
        const { reviewedBy, review, rating, bookId, reviewedAt } = reviewDetails;

        // =====================Checking If The BookId Coming In The Path Params Is A Valid BookId Present In The Database===========
        if (!validateObjectId(bookPId)) return res.status(400).send({ status: false, message: "Please Correct the bookId, Its Invalid" });
        if (bookId) {
            if (bookPId !== bookId) return res.status(400).send({ status: false, message: "params bookId as well as body bookId must be same" })
            reviewDetails.bookId = bookPId
        } else {
            reviewDetails.bookId = bookPId
        }
        const bookCheck = await bookModel.findOne({ _id: bookPId, isDeleted: false });
        if (!bookCheck) return res.status(404).send({ status: false, message: "No Book Found For The Given BookId, please Confirm The bookId" });

        // ====================Validating ReviewedBy Field Coming In The Request Object And Making It A Grammatically Correct Name ===================================
        if (reviewedBy) {
            if (!validateName(reviewedBy)) return res.status(400).send({ status: false, message: "Please Confirm ReviewedBy Field, ReviewedBy Field Should Be A Alphabetical String Only" })
            reviewDetails.reviewedBy = ConversionToProperName(reviewedBy);
        } else {
            // =====================If Reviewer Is Not mentioned In The Request Body We Insert It As Guest In The Request Body Below================
            reviewDetails.reviewedBy = "Guest";
        }

        //==============================================================Inserting The Present Date In The Request Object As The ReviewedAt Date=======================================================
        if (typeof reviewedAt === "string") {
            if (!validDate.test(reviewedAt)) return res.status(400).send({ status: false, message: 'Please enter the reviewedAt date in "YYYY-MM-DD" format' })
        } else {
            reviewDetails.reviewedAt = today.format('YYYY-MM-DD')
        }
        //reviewDetails.reviewedAt = today.format();

        // ==========================================================================================================================================================================================
        if (!rating) return res.status(400).send({ status: false, message: "Please Enter Ratings Data, Its A Mandatory Field" });
        if (typeof rating !== "number" || ! /^([1-5])$/.test(rating)) return res.status(400).send({ status: false, message: "Ratings Should Be A Number Between 1 to 5 Only" })
        if (review) {
            if (!stringChecking(review)) return res.status(400).send({ status: false, message: "Review Field Should Be A String Only" })
        };

        // ===============================================Adding A IsDeleted Key In The Request Object With A Default False Value Below==============================================
        reviewDetails.isDeleted = false;

        // ================================================Saving The Review Request Object In the Database=====================================================================
        const createdReview = await reviewModel.create(reviewDetails);

        // ==================================================When The Book Review Gets Successfully Created,We Update The Reviews Count Of The Book Below===============================
        const bookWithReview = await bookModel.findByIdAndUpdate(bookPId, { $inc: { reviews: 1 } }, { new: true });
        const result = { ...bookWithReview._doc, createdReview }

        return res.status(201).send({ status: true, message: 'Success', data: result });
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}

// =================================================================================================================================================================================================================================



const updateReview = async function (req, res) {
    try {
        const reqParams = req.params;
        const { bookId, reviewId } = reqParams;
        const data = req.body;
        const { review, rating, reviewedBy } = data;

        // =============================Checking If The BookId Coming In The Path Params Is A Valid BookId Present In The Database===================================================
        if (Object.keys(data).length == 0) return res.status(400).send({ status: false, message: "Request Body Can't Be Blank" });
        if (!validateObjectId(bookId)) return res.status(400).send({ status: false, message: "Please Correct the BookId, It's Invalid" });
        const bookCheck = await bookModel.findOne({ _id: bookId, isDeleted: false });
        if (!bookCheck) return res.status(400).send({ status: false, message: "No Book Found For The Given BookId, Please Confirm The BookId" });



        // =====================================Checking If The ReviewId Coming In The Path Params Is A Valid ReviewId Present In The Database======================
        if (!validateObjectId(reviewId)) return res.status(400).send({ status: false, message: "Please Correct the ReviewId, Its Invalid" });
        const reviewCheck = await reviewModel.findOne({ _id: reviewId, isDeleted: false });
        if (!reviewCheck) return res.status(400).send({ status: false, message: "No Review Found For The Given ReviewId, Please Confirm The ReviewId" });

        // ====================================Validating If the Request Body Contains Rating,Review,ReviewedBy,If It Contains Then Validating If Its In Proper Format=====================

        if (review) {
            if (!stringChecking(review)) return res.status(400).send({ status: false, message: "Review Field Should Be A Non Empty String Only" })

        };
        if (rating) {
            if (typeof rating !== "number" || ! /^([1-5])$/.test(rating)) return res.status(400).send({ status: false, message: "Ratings Should Be A Number Between 1 to 5 Only" })
        };
        if (reviewedBy) {
            if (!stringChecking(reviewedBy) || !validateName(reviewedBy)) return res.status(400).send({ status: false, message: "Please Confirm ReviewedBy Field, ReviewedBy Field Should Be A Alphabetical String Only" });
        } else {
            // ===============================If Reviewer Is Not mentioned In The Request Body We Insert It As Guest In The Request Body Below==================================
            req.body.reviewedBy = "Guest";
        }
        // ============================================Validating If The Request Body Doesnt Have Random fields Other Than Rating,reviewedBy And review=============================
        if (!rating && !reviewedBy && !review && Object.keys(req.body).length > 0) {
            return res.status(400).send({ status: false, message: "Request Body Will Contain Only Data For rating, reviewedBy & review" })
        }


        const updatedReview = await reviewModel.findByIdAndUpdate(reviewId, { $set: req.body }, { new: true });
        const updatedBook = await bookModel.findById(bookId);
        const result = { ...updatedBook._doc, updatedReview }


        return res.status(200).send({ status: true, message: "Books List", data: result });
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}

// =========================================================================================================================================================================================================================
const deleteReview = async function (req, res) {
    try {
        const reqParams = req.params;
        const { bookId, reviewId } = reqParams;



        // =====================Checking If The BookId Coming In The Path Params Is A Valid BookId Present In The Database And Is Not Deleted===========
        if (!validateObjectId(bookId)) return res.status(400).send({ status: false, message: "Please Correct the BookId, Its Invalid" });
        const bookCheck = await bookModel.findOne({ _id: bookId, isDeleted: false });
        if (!bookCheck) return res.status(404).send({ status: false, message: "No Book Found For The Given BookId, Please Confirm The BookId" });

        // =====================Checking If The ReviewId Coming In The Path Params Is A Valid ReviewId Present In The Database And Is Not Deleted===========
        if (!validateObjectId(reviewId)) return res.status(400).send({ status: false, message: "Please Correct the ReviewId, Its Invalid" });
        const reviewCheck = await reviewModel.findOne({ _id: reviewId, isDeleted: false });;
        if (!reviewCheck) return res.status(404).send({ status: false, message: "No review found" })

        // =======================Marking IsDeleted Key Of The Review Document As True=====================================================================
        const deletedReview = await reviewModel.findByIdAndUpdate({ _id: reviewId }, { $set: { isDeleted: true } });

        // ========================Since The Review Of The Book Is Marked Deleted,We Will Now Update The Book Documents Review Count By Decreasing It By One=========
        const updatedBook = await bookModel.findByIdAndUpdate({ _id: bookId }, { $inc: { reviews: -1 } });

        return res.status(200).send({ status: true, message: "Review Deleted Successfully" })
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }

}


module.exports = { createReview, updateReview, deleteReview };