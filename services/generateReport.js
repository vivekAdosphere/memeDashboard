const fs = require('fs')
const path = require('path')
const xl = require('excel4node')
const logger = require('./logger')
const moment = require('moment-timezone')
const { SERVER_URL } = require('../configs/configs')
const { getIndianDateTime } = require('./utilities')
const { fetchAllDetails } = require('./mongoFunctions')

module.exports = async (city, userRole, month) => {
    try {
        let currentYear
        let currentMonth

        const answerFilter = {}
        // Define the start and end of the current month
        if (month) {
            currentYear = month.split('-')[0]
            currentMonth = month.split('-')[1]
            const currentDate = moment.tz('Asia/Kolkata')

            // Construct a valid date string with current year, month, and day '01'
            const dateString = `${currentDate.year()}-${currentMonth}-01`

            // Define the start and end of the current month using Moment.js and Moment-Timezone
            const startOfMonth = new Date(moment.tz(dateString, 'YYYY-MM-DD').startOf('month').format('YYYY-MM-DDTHH:mm:ss.SSSZ'))
            const endOfMonth = new Date(moment.tz(dateString, 'YYYY-MM-DD').endOf('month').format('YYYY-MM-DDTHH:mm:ss.SSSZ'))

            answerFilter.createdAt = {
                $gte: startOfMonth,
                $lte: endOfMonth
            }
        }

        const filterExpression = {}
        if (userRole !== 'super-admin') {
            filterExpression['user.city'] = city
        }

        let dataForSheet = await fetchAllDetails(answerFilter, filterExpression)

        var wb = new xl.Workbook()
        var ws = wb.addWorksheet('Insights')
        var ws1 = wb.addWorksheet('Data')

        let styleForHeaders = (header = true) => {
            let style = {
                border: {
                    left: {
                        style: 'thin'
                    },
                    right: {
                        style: 'thin'
                    },
                    top: {
                        style: 'thin'
                    },
                    bottom: {
                        style: 'thin'
                    }
                }
            }

            if (header) {
                style['font'] = {
                    bold: true
                }
                ;(style['alignment'] = {
                    horizontal: ['center']
                }),
                    (style['fill'] = {
                        type: 'pattern',
                        patternType: 'solid',
                        bgColor: '#ff9900',
                        fgColor: '#ff9900'
                    })
            }

            return wb.createStyle(style)
        }

        // 2nd Sheet
        ws1.cell(1, 1).string('Sr. No').style(styleForHeaders())
        ws1.cell(1, 2).string('Mobile Number').style(styleForHeaders())
        ws1.cell(1, 3).string('Name').style(styleForHeaders())
        ws1.cell(1, 4).string('City').style(styleForHeaders())
        ws1.cell(1, 5).string('Gender').style(styleForHeaders())
        ws1.cell(1, 6).string('Date').style(styleForHeaders())
        ws1.cell(1, 7).string('Time').style(styleForHeaders())
        ws1.cell(1, 8).string('Answer').style(styleForHeaders())
        ws1.cell(1, 9).string('Participation Status').style(styleForHeaders())
        ws1.cell(1, 10).string('Source').style(styleForHeaders())
        ws1.cell(1, 11).string('Age').style(styleForHeaders())
        ws1.cell(1, 12).string('Language').style(styleForHeaders())

        for (let i = 1; i <= 11; i++) {
            ws1.column(i).setWidth(25)
        }

        for (let i = 1; i <= 2; i++) {
            ws.column(i).setWidth(20)
        }

        let counters = {
            total: 0
        }

        for (let j = 0; j < dataForSheet.length; j++) {
            let dateTime = getIndianDateTime(dataForSheet[j].createdAt)
            let date = dateTime.format('DD-MM-YYYY')
            let time = dateTime.format('hh:mm:ss A')

            ws1.cell(j + 2, 1)
                .string((j + 1).toString())
                .style(styleForHeaders(false))
            ws1.cell(j + 2, 2)
                .string(dataForSheet[j].user.number ? dataForSheet[j].user.number : 'NA')
                .style(styleForHeaders(false))
            ws1.cell(j + 2, 3)
                .string(dataForSheet[j].user.userName ? dataForSheet[j].user.userName : 'NA')
                .style(styleForHeaders(false))
            ws1.cell(j + 2, 4)
                .string(dataForSheet[j].user.city ? dataForSheet[j].user.city : 'NA')
                .style(styleForHeaders(false))
            ws1.cell(j + 2, 5)
                .string(dataForSheet[j].user.userGender ? dataForSheet[j].user.userGender : 'NA')
                .style(styleForHeaders(false))
            ws1.cell(j + 2, 6)
                .string(date)
                .style(styleForHeaders(false))
            ws1.cell(j + 2, 7)
                .string(time)
                .style(styleForHeaders(false))
            ws1.cell(j + 2, 8)
                .string(dataForSheet[j].answer ? dataForSheet[j].answer : 'NA')
                .style(styleForHeaders(false))
            ws1.cell(j + 2, 9)
                .string(dataForSheet[j].entryCompletionStatus ? 'Participated' : 'Not Participated')
                .style(styleForHeaders(false))
            ws1.cell(j + 2, 10)
                .string(dataForSheet[j].user.adType ? dataForSheet[j].user.adType : 'NA')
                .style(styleForHeaders(false))
            ws1.cell(j + 2, 11)
                .string(dataForSheet[j].user.userAge ? dataForSheet[j].user.userAge.toString() : 'NA')
                .style(styleForHeaders(false))
            ws1.cell(j + 2, 12)
                .string(dataForSheet[j].user.language ? dataForSheet[j].user.language : 'NA')
                .style(styleForHeaders(false))

            // Total Counter
            counters['total'] += 1
        }

        // 1st Sheet
        ws.cell(1, 1, 1, 2, true).string('Insights').style(styleForHeaders())
        ws.cell(2, 1).string('Total Entries').style(styleForHeaders())
        ws.cell(2, 2).string(counters.total.toString()).style(styleForHeaders(false))

        const fileName = 'RC-Report.xlsx'
        const filePath = path.join(__dirname, '../public', 'reports', fileName)
        wb.write(filePath, function (err) {
            if (err) {
                logger.error(`Error, Unable to Create Excel. --> ${err.stack}`)
            } else {
                logger.info('Excel Created Successfully')
            }
        })

        if (fs.existsSync(filePath)) {
            return [`${SERVER_URL}/reports/RC-Report.xlsx`, fileName]
        }

        return ['#', fileName]
    } catch (err) {
        logger.error(`Something went wrong --> ${err.stack}`)
    }
}
