const userModel = require("../models/userModel");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const { ConversionToProperName, validateMobile, validateName, checkPassword } = require("../validators/validator");







const createUser = async function (req, res) {
    try {
        if (Object.keys(req.body).length == 0) return res.status(400).send({ status: false, msg: "Request Body Cant Be Empty" });
        let user = req.body;
        if (!user.title) return res.status(400).send({ status: false, msg: "Please Enter Title,Title Is A Mandatory Field" });
        if (typeof user.title !== "string") return res.status(400).send({ status: false, msg: "Please Enter A Valid Title Field" });
        if (user.title !== "Mr" && user.title !== "Mrs" && user.title !== "Miss") return res.status(400).send({ status: false, msg: "Please Enter A Valid Title Field" });
        if (!user.name) return res.status(400).send({ status: false, msg: "Please Enter Name,Name Is A Mandatory Field" });
        if (!validateName(user.name)) return res.status(400).send({ status: false, msg: "Please Enter A Valid Name" });
        user.name.trim();
        user.name = user.name.toLowerCase()
        user.name = ConversionToProperName(user.name);
        if (!user.phone) return res.status(400).send({ status: false, msg: "Please Enter Phone,Phone Is A Mandatory Field" });
        if (user.phone.length > 10) return res.status(400).send({ status: false, msg: "Please Enter A Valid Phone Number" });
        if (!validateMobile(user.phone)) return res.status(400).send({ status: false, msg: "Please Enter A Valid Phone Number" });
        if (!user.email) return res.status(400).send({ status: false, msg: "Please Enter Email,Email Is A Mandatory Field" });
        if (!validator.isEmail(user.email)) return res.status(400).send({ status: false, msg: "Please Enter A Valid Email" });

        let uniquePhoneEmail = await userModel.findOne({ $or: [{ email: user.email }, { phone: user.phone }] });
        if (uniquePhoneEmail) {
            if (uniquePhoneEmail.phone === user.phone) return res.status(400).send({ status: false, msg: "Phone Already Exists,Please Input Another Phone Number" });
            else { return res.status(400).send({ status: false, msg: "Email Already Exists,Please Input Another EmailId" }) }
        };

        if (!user.password) return res.status(400).send({ status: false, msg: "Please Enter Password,Password Is A Mandatory Field" });
        if (!checkPassword(user.password)) return res.status(400).send({ status: false, msg: "Please Enter A Valid Password,Password Length Should Be Minimum 8 And Maximum 15 and should contain UpperCase, lowercase apl" });
        if (typeof user.address !== "object") return res.status(400).send({ status: false, msg: "Address Should Be An Object" });
        if (user.address) {

            if (user.address.street) {
                if (user.address.street == "") return res.status(400).send({ status: false, msg: "Street Should Be A Non Empty String" })
                if (typeof user.address.street !== "string") {
                    return res.status(400).send({ status: false, msg: "Street Should Be A Non Empty String" })
                }
            }; if (user.address.city) {
                if (user.address.city == "") return res.status(400).send({ status: false, msg: "City Should Be A Non Empty String Of Alphabets" })
                if (typeof user.address.city !== "string" || !/^[a-zA-Z]*$/.test(user.address.city)) {
                    return res.status(400).send({ status: false, msg: "City Should Be A Non Empty String Of Alphabets" })
                }
            } if (user.address.pincode) {
                if (user.address.pincode == "") return res.status(400).send({ status: false, msg: "Pincode Should Be A Non Empty String Of Numbers and Should Have 6 Digits" })
                if (typeof user.address.pincode !== "string" || !/^[1-9][0-9]{5}$/.test(user.address.pincode)) {
                    return res.status(400).send({ status: false, msg: "Pincode Should Be A Non Empty String Of Numbers and Should have 6 digits" })
                }
                let savedUser = await userModel.create(user);
                return res.status(201).send({ status: true, message: "User Created Successfully", data: savedUser })
            }
            else {
                let savedUser = await userModel.create(user);
                return res.status(201).send({ status: true, message: "User Created Successfully", data: savedUser })
            }
        }
    }

    catch (error) {
        return res.status(500).send({ status: false, msg: error.message })
    }
}



const userLogin = async function (req, res) {
    try {
        if (Object.keys(req.body).length == 0) return res.status(400).send({ status: false, msg: "Request Body Cant Be Empty" });
        let user = req.body;
        if (!user.email) return res.status(400).send({ status: false, msg: "Please Enter Your Email" });
        if (!user.password) return res.status(400).send({ status: false, msg: "Please Enter Your Password" });

        let loggedInUser = await userModel.findOne({ email: user.email, password: user.password });
        if (!loggedInUser) return res.status(404).send({ status: false, msg: "No user Found With The Input Credentials,Please Confirm The Credentials" });

        let token = jwt.sign({ userId: loggedInUser._id }, "veryverysecuresecretkey", { expiresIn: '1h' });
        return res.status(200).send({ status: true, message: "Success", data: token })
    }
    catch (error) {
        return res.status(500).send({ status: false, msg: error.message })
    }

}









module.exports.createUser = createUser;
module.exports.userLogin = userLogin;