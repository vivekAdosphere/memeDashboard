const passport = require('passport')
const router = require('express').Router()
const auth = require('../../middlewares/auth')
const guest = require('../../middlewares/guest')
const logger = require('../../services/logger')

//excel js dependecies
const ExcelJS = require('exceljs')
const { readMetaDataFromExcel, readInsightsDataFromExcel, readOverviewDataFromExcel } = require('../../services/xlsx')
const { updateReport } = require('../../services/reportUpdate')

const filePath = './insight/report.xlsx'
// Homepage
router.get('/', (req, res) => {
    const errorMessage = req.session.errorMessage || ''

    if (errorMessage) {
        req.session.errorMessage = ''
    }

    return res.status(200).render('homepage', { errorMessage })
})

// Login
router.get('/login', guest, (req, res) => {
    return res.status(200).render('login')
})

// Login
router.post('/login', async (req, res, next) => {
    try {
        const { useremail, userpassword } = req.body

        // Validate request
        if (!useremail || !userpassword) {
            req.flash('error', 'All fields are required')
            return res.redirect('/login')
        }

        passport.authenticate('local', (err, user, info) => {
            if (err) {
                req.flash('error', info.message)
                return next(err)
            }
            if (!user) {
                req.flash('error', info.message)
                return res.redirect('/login')
            }
            req.logIn(user, (err) => {
                if (err) {
                    req.flash('error', info.message)

                    return next(err)
                }
                req.session.selectedProject = 'ALL'
                req.session.selectedSheetName = 'ALL'
                req.session.selectedCampaignMonth = 'ALL'
                req.session.isDetailed = false
                req.session.role = user.role
                return res.redirect(`/dashboard/1`)
            })
        })(req, res, next)
    } catch (err) {
        logger.error(`Error --> ${JSON.stringify(err.stack)}`)
        return res.redirect('/')
    }
})

// Dashboard - redirection
router.get('/dashboard', auth, (req, res) => {
    return res.redirect(`/dashboard/1`)
})

router.post('/dashboard', async (req, res) => {
    const dates = req.body.dates || ''
    const selectedProject = req.body.projects
    const selectedSheetName = req.body['sub-projects']
    const selectedCampaignMonth = req.body['campaign-month'] || 'ALL'

    let isDetailed = Boolean(req.body.isDetailed)
    if (selectedProject === 'ALL') {
        isDetailed = false
    }
    req.session.selectedProject = selectedProject
    req.session.selectedSheetName = selectedSheetName
    req.session.selectedCampaignMonth = selectedCampaignMonth
    req.session.isDetailed = isDetailed
    req.session.dates = dates

    return res.redirect('/dashboard/1')
})

// dashboard with pagination
router.get('/dashboard/:page', auth, async (req, res) => {
    try {
        // Current Page
        const currentPage = req.params.page || 1

        let selectedProject = req.session.selectedProject
        let selectedSheetName = req.session.selectedSheetName
        let isDetailed = req.session.isDetailed
        let selectedCampaignMonth = req.session.selectedCampaignMonth
        let dates = req.session.dates
        let userRole = req.session.role
        console.log(dates)
        // checking if user is entering string
        if (isNaN(currentPage)) {
            return res.redirect(`/dashboard/1`)
        }

        // checking if page is less than 1
        if (parseInt(currentPage) < 1) {
            return res.redirect(`/dashboard/1`)
        }

        const workbook = new ExcelJS.Workbook()
        await workbook.xlsx.readFile(filePath)

        // Reading Meta Data
        const { metaData, projects } = readMetaDataFromExcel(workbook, 'Metadata')

        // Reading Insights
        const filter = { projectName: selectedProject, subProjectName: selectedSheetName, selectedCampaignMonth, dates }

        let { campaignNames, summaryData, insights, growthDataArray, sortedByViewsArray } = await readInsightsDataFromExcel(
            workbook,
            filter,
            isDetailed,
            metaData
        )

        const overviewData = await readOverviewDataFromExcel(workbook, metaData, isDetailed, filter)

        return res.status(200).render('dashboard', {
            metaData,
            summaryData,
            selectedProject,
            overviewData,
            projects,
            dates,
            selectedCampaignMonth,
            campaignNames,
            isDetailed,
            insights,
            selectedProject,
            selectedSheetName,
            growthDataArray,
            sortedByViewsArray,
            userRole
        })
    } catch (err) {
        req.session.errorMessage = 'Please try again after some time...'
        logger.error(`Error --> ${JSON.stringify(err.stack)}`)
        return res.redirect('/')
    }
})

router.post('/refreshdata', async (req, res) => {
    try {
        await updateReport()
        res.redirect('/dashboard')
    } catch (err) {
        res.send({
            success: false,
            statusCode: 400,
            message: 'Data updation failed! Please try again later.'
        })
    }
})

// Logout
router.post('/logout', (req, res) => {
    req.logout((error) => {
        if (error) {
            logger.error(`Error --> ${JSON.stringify(error.stack)}`)
            return res.sendStatus(500)
        }
        req.session.destroy((err) => {
            if (err) {
                logger.error(`Error --> ${JSON.stringify(error.stack)}`)
                return res.sendStatus(500)
            }
            res.clearCookie('connect.sid', {
                path: '/'
            })
            res.redirect('/')
        })
    })
})

module.exports = router
