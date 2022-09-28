const stringChecking = function (data) {
    if (typeof data !== 'string') {
        return false;
    } else if (typeof data === 'string' && data.trim().length === 0) {
        return false;
    } else {
        return true;
    }
}


const validISBN = /^(?=(?:\D*\d){13}(?:(?:\D*\d){3})?$)[\d-]+$/ //-------------> for 13
///^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/ -------------> for 10 and 13 only

const validDate = /^\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$/

function validateObjectId(id) {
    var bool = false;
    if (id.length == 24) bool = /[a-f]+/.test(id);
    return bool;
}


function validateName($name) {
    var nameReg = /^[A-Za-z ]*$/;
    if (!nameReg.test($name)) {
        return false;
    } else {
        return true;
    }
};


function ConversionToProperName(name) {

    const name2 = name.trim().toLowerCase().split(" ");
    return name2.map((x) => { return x[0].toUpperCase() + x.substring(1) }).join(" ");

}


function validateMobile($mobile) {
    var mobileReg = /^([0|\+[0-9]{1,5})?([7-9][0-9]{9})$/;
    if (!mobileReg.test($mobile)) {
        return false;
    } else {
        return true;
    }
}


function checkPassword(str) {
    var re = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,15}$/;
    return re.test(str);
}

module.exports = { stringChecking, validISBN, validDate, validateObjectId, validateName, ConversionToProperName, checkPassword, validateMobile }