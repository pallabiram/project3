const jwt = require("jsonwebtoken")
const bookModel = require('../models/bookModel')
const {validateObjectId} = require('../validators/validator')

const authentication = async function (req, res, next) {
    try {
        let token = req.headers["x-api-key"]

        if (!token) return res.status(400).send({ status: false, msg: "Token must be present in the request header" })

        jwt.verify(token, "veryverysecuresecretkey", (error, decodedToken) => {
            if (error) {
                return res.status(401).send({ status: false, msg: "Token is Invalid" })
            }
            else {
                res.setHeader("x-api-key", token)
                req.decodedToken = decodedToken
                next()
            }
        })
    }
    catch (err) {
        return res.status(500).send({ message: "error", error: err.message })
    }
}

const authorization = async function (req, res, next) {
    try {
        let decoded = req.decodedToken
        let paramsBookId = req.params.bookId
        if (!validateObjectId(paramsBookId)) return res.status(400).send({ status: false, msg: "please enter valid bookId" })
        let userLoggedIn = decoded.userId
        let book = await bookModel.findById(paramsBookId)
        if (!book) {
            return res.status(404).send({ status: false, message: "Book not Found" })
        }
        let bookUserId = (book.userId).toString()
        if (bookUserId !== userLoggedIn) {
            return res.status(403).send({ status: false, message: "You are not authorised Person" })
        }
        next()
    }
    catch (err) {
        res.status(500).send({ message: "Error", error: err.message })
    }
}

module.exports = {authentication, authorization}