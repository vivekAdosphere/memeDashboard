const moment = require('moment')
const crypto = require('bcrypt')

exports.getIndianDateTime = (dateTime) => {
    if (dateTime) {
        return moment(dateTime).utcOffset(330)
    }

    return moment().utcOffset(330)
}

exports.hashPassword = async (password) => {
    try {
        return await crypto.hash(password, 10)
    } catch (err) {
        throw new Error(`${err.stack}`)
    }
}

exports.getRandomCharFromString = (str) => str.charAt(Math.floor(Math.random() * str.length))

exports.generatePassword = (name) => {
    // const Allowed = {
    //     Uppers: 'QWERTYUIOPASDFGHJKLZXCVBNM',
    //     Lowers: 'qwertyuiopasdfghjklzxcvbnm',
    //     Numbers: '1234567890',
    //     Symbols: '!@#$%^&*'
    // }

    // let pwd = ''
    // pwd += this.getRandomCharFromString(Allowed.Uppers) //pwd will have at least one upper
    // pwd += this.getRandomCharFromString(Allowed.Lowers) //pwd will have at least one lower
    // pwd += this.getRandomCharFromString(Allowed.Numbers) //pwd will have at least one number
    // pwd += this.getRandomCharFromString(Allowed.Symbols) //pwd will have at least one symbol

    // for (let i = pwd.length; i < length; i++) pwd += this.getRandomCharFromString(Object.values(Allowed).join('')) //fill the rest of the pwd with random characters

    return name + '123!'
    // return pwd
}

exports.getCellValue = (cellValue) => {
    if (typeof cellValue === 'undefined' || cellValue === '' || cellValue === '-') {
        return 0
    }
    const parsedValue = Number(cellValue)
    // console.log(cellValue)
    if (isNaN(parsedValue)) {
        return 0 // Raise an error
    }
    return parsedValue
}
