const userModel = require('../models/userModel')
const bookModel = require('../models/bookModel')
const reviewModel = require('../models/reviewModel')
const { stringChecking, validateObjectId, validISBN, validDate, ConversionToProperName } = require('../validators/validator')
const moment = require('moment');
const today = moment()

const createBook = async function (req, res) {
    try {
        const booksData = req.body
        let decoded = req.decodedToken

        if (Object.keys(booksData).length === 0) {
            return res.status(400).send({ status: false, message: "Please enter required details in request body" })
        }

        const { title, excerpt, userId, ISBN, category, subcategory, releasedAt, reviews, bookCover } = booksData

        if (!stringChecking(title)) return res.status(400).send({ status: false, message: "title must be present with non-empty string" })
        const duplicateTitle = await bookModel.findOne({ title: title })
        if (duplicateTitle) return res.status(400).send({ status: false, message: "Title must be unique" })

        if (!stringChecking(excerpt)) return res.status(400).send({ status: false, message: "excerpt must be present with non-empty string" })

        if (!stringChecking(userId)) return res.status(400).send({ status: false, message: "userId must be present" })

        if (!validateObjectId(userId)) return res.status(400).send({ status: false, message: "userId must be valid, please write in correct format" })

        if (decoded.userId !== userId) return res.status(403).send({ status: false, message: "You are not authorised, provide your's userId" })

        if (!validISBN.test(ISBN)) return res.status(400).send({ status: false, message: "ISBN must be present and valid, please write in  13 digit format" })

        const duplicateISBN = await bookModel.findOne({ ISBN: ISBN })
        if (duplicateISBN) return res.status(400).send({ status: false, message: "ISBN must be unique" })

        if (!stringChecking(category)) return res.status(400).send({ status: false, message: "category must be present with non-empty string" })

        if (!stringChecking(subcategory)) return res.status(400).send({ status: false, message: "subcategory must be present with non-empty string" })

        if (typeof releasedAt === "string") {
            if (!validDate.test(releasedAt)) return res.status(400).send({ status: false, message: 'Please enter the releasedAt date in "YYYY-MM-DD" format' })
        } else {
            booksData.releasedAt = today.format('YYYY-MM-DD')
        }
        if(reviews){
            booksData.reviews = 0
        }
        booksData.isDeleted = false
        booksData.bookCover= bookCover


        const book = await bookModel.create(booksData)
        return res.status(201).send({ status: true, message: "Book Created successfully", data: book })

    } catch (error) {
        return res.status(500).send({ status: false, error: error.message })
    }

}

const getBooks = async function (req, res) {
    try {
        const booksData = req.query

        if (Object.keys(booksData).length === 0) {
            const getData = await bookModel.find({ isDeleted: false }).sort({ title: 1 }).select({ title: 1, excerpt: 1, userId: 1, category: 1, reviews: 1, releasedAt: 1 })
            if (getData.length === 0) {
                return res.status(404).send({ status: false, message: "No book found" })
            }
            return res.status(200).send({ status: true, message: "Books list", count: getData.length, data: getData })
        } else {

            const { userId, category, subcategory } = booksData
            const filter = {}

            if (userId) {
                if (!validateObjectId(userId)) return res.status(400).send({ status: false, message: "userId must be valid, please write in correct format" })
                const usersId = await userModel.findOne({ _id: userId })
                if (!usersId) return res.status(400).send({ status: false, message: "No user found, provide correct userId" })
                filter.userId = usersId
            }

            if (category) {
                filter.category = category
            }

            if (subcategory) {
                filter.subcategory = subcategory
            }
            filter.isDeleted = false
            if (userId || category || subcategory) {
                const getAllBooks = await bookModel.find(filter).sort({ title: 1 }).select({ title: 1, excerpt: 1, userId: 1, category: 1, reviews: 1, releasedAt: 1 })
                if (getAllBooks.length === 0) return res.status(404).send({ status: false, message: "No books found" })
                return res.status(200).send({ status: true, message: "Books list", count: getAllBooks.length, data: getAllBooks })
            } else {
                return res.status(400).send({ status: false, msg: "filters can be userId, category, subcategory" })
            }

        }

    } catch (error) {
        return res.status(500).send({ status: false, error: error.message })
    }



}
const getBookById = async function (req, res) {
    try {
        const bookId = req.params.bookId

        if (!validateObjectId(bookId)) return res.status(400).send({ status: false, message: "bookId must be present and  valid, please write in correct format" })

        const bookDetails = await bookModel.findById(bookId).lean()
        if (!bookDetails) return res.status(404).send({ status: false, message: "No book found in the database." })
        if (bookDetails.isDeleted === true) return res.status(400).send({ status: false, message: "This book has already been deleted." })

        const reviews = await reviewModel.find({ bookId: bookDetails._id, isDeleted: false }).select({ bookId: 1, reviewedBy: 1, reviewedAt: 1, rating: 1, review: 1 })
        bookDetails.reviewsData = reviews
        return res.status(200).send({ status: true, message: "Books list", reviewsCount: reviews.length, data: bookDetails })

    } catch (error) {
        return res.status(500).send({ status: false, error: error.message })
    }


}
const updateBook = async function (req, res) {
    try {
        const bookId = req.params.bookId

        if (!validateObjectId(bookId)) return res.status(400).send({ status: false, message: "bookId must be present and  valid, please write in correct format" })

        const book = await bookModel.findById(bookId)
        if (book.isDeleted === true) return res.status(400).send({ status: false, message: "This book is already deleted." })

        const data = req.body
        if (Object.keys(data).length === 0) return res.status(400).send({ status: false, message: "Provide the data in the body to update." })
        const { title, excerpt, releasedAt, ISBN } = data

        if (title || excerpt || ISBN || releasedAt) {
            if (title) {
                if (!stringChecking(title)) return res.status(400).send({ status: false, message: "title should be  non-empty string" })
                const duplicateTitle = await bookModel.findOne({ title: title })
                if (duplicateTitle) return res.status(400).send({ status: false, message: "title is not unique, please provide another one." })
            }
            if (excerpt) {
                if (!stringChecking(excerpt)) return res.status(400).send({ status: false, message: "excerpt should be non-empty string" })
            }
            if (ISBN) {
                if (!validISBN.test(ISBN)) return res.status(400).send({ status: false, message: "This ISBN is not valid" })
                const duplicateISBN = await bookModel.findOne({ ISBN: ISBN })
                if (duplicateISBN) return res.status(400).send({ status: false, message: "ISBN must be unique." })
            }
            if (releasedAt) {
                if (!validDate.test(releasedAt)) return res.status(400).send({ status: false, message: 'Please enter the releasedAt date in "YYYY-MM-DD" format' })
            }
        } else {
            return res.status(400).send({ status: false, message: "Please provide any one from these constraints title, excerpt, ISBN or releasedAt" })
        }
        const updatedBook = await bookModel.findOneAndUpdate(
            { _id: bookId },
            { $set: { title: title, excerpt: excerpt, releasedAt: releasedAt, ISBN: ISBN } },
            { new: true }
        )
        return res.status(200).send({ status: true, message: 'Success', data: updatedBook })
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }


}

const deleteById = async function (req, res) {
    try {
        const bookId = req.params.bookId
        if (!validateObjectId(bookId)) return res.status(400).send({ status: false, message: "bookId must be present and valid, please write in correct format" })
        let book = await bookModel.findById(bookId)
        if(!book) return res.status(404).send({ status: false, message: "book not found" })
        if (book.isDeleted === true) return res.status(400).send({ status: false, message: "This book is already deleted." })

        await bookModel.findOneAndUpdate(
            { _id: bookId },
            { $set: { isDeleted: true, deletedAt: Date.now() } }
        )
        return res.status(200).send({ status: true, message: "Book deleted succesfully." })
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}



module.exports = { createBook, getBooks, getBookById, updateBook, deleteById }
