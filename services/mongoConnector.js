const mongoose = require('mongoose')
const config = require('../configs/configs')
const logger = require('./logger')

//=> Config Variables
const MONGODB_CONNECTION_STRING = config.MONGODB_CONNECTION_STRING

module.exports = async () => {
    try {
        await mongoose.connect(MONGODB_CONNECTION_STRING, {
            useNewUrlParser: true,
            // useFindAndModify: false,
            useUnifiedTopology: true
            // useCreateIndex: true
        })
        logger.info('Success, Database Connected Successfully.')
    } catch (e) {
        logger.error(`Error, Database Connection Failed --> ${JSON.stringify(e)}`)
    }
}
