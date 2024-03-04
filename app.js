const path = require('path')
const express = require('express')
const config = require('./configs/configs')
const mongoConnector = require('./services/mongoConnector')
const session = require('express-session')
const flash = require('express-flash')
const passport = require('passport')
const MongoDBStore = require('connect-mongodb-session')(session)
const logger = require('./services/logger')
const seeds = require('./seeds')
const { updateReport } = require('./services/reportUpdate')
const { CronJob } = require('cron')

// Defining Express App
const app = express()

// Config Variables
const PORT = config.PORT || 5000
const SERVER_URL = config.SERVER_URL
const COOKIE_SECRET = config.COOKIE_SECRET
const MONGODB_CONNECTION_STRING = config.MONGODB_CONNECTION_STRING

// Middlewares
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))

app.set('trust proxy', 1)
app.disable('x-powered-by')

const store = new MongoDBStore({
    uri: MONGODB_CONNECTION_STRING,
    collection: 'sessions',
    expires: 24 * 60 * 60 * 1000 //24 hour session
})

app.use(
    session({
        secret: COOKIE_SECRET,
        resave: true, // make it true for inactivity session
        store: store,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: config.DEBUG === 'false' ? true : false,
            sameSite: config.DEBUG === 'false' ? `none` : `lax`,
            expires: 24 * 60 * 60 * 1000, // 15 min of inactivity
            path: '/'
        }
    })
)

const passportInit = require('./configs/passport')
passportInit(passport)
app.use(passport.initialize())
app.use(passport.session())

// Flash Messages
app.use(flash())

// Global middleware
app.use((req, res, next) => {
    res.locals.session = req.session
    res.locals.user = req.user
    next()
})

// Routes
// const apiRoutes = require("./routes/api");
const webRoutes = require('./routes/web')

// Setting Express Variables
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(function (req, res, next) {
    res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0')
    next()
})

// app.use("/api/v1", apiRoutes);
app.use('/', webRoutes)
app.use((req, res) => {
    return res.status(404).render('404')
})

app.use(function (req, res, next) {
    res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0')
    next()
})

// cron job for updatig report sheet

const cronTime = '0 * * * *'
const job = CronJob.from({
    cronTime: cronTime,
    onTick: async () => {
        try {
            await updateReport()
        } catch (err) {
            logger.error('Failed to download the sheet!')
        }
    },
    start: true,
    timeZone: 'Asia/Kolkata'
})

// Listening to App
app.listen(PORT, async () => {
    logger.info(`Application is running on HOST : ${SERVER_URL} and PORT : ${PORT}`)
    mongoConnector().catch((err) => logger.error(err))
    seeds().catch((err) => logger.error(err))
    await updateReport()
})
