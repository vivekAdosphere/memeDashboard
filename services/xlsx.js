const moment = require('moment')
const { getCellValue } = require('./utilities')

function getDates(startDate, endDate) {
    var dates = []
    var currentDate = startDate.clone()
    while (currentDate <= endDate) {
        dates.push(currentDate.format('DD/MM/YYYY'))
        currentDate = currentDate.clone().add(1, 'days')
    }
    return dates
}

const months = {
    January: 1,
    February: 2,
    March: 3,
    April: 4,
    May: 5,
    June: 6,
    July: 7,
    August: 8,
    September: 9,
    October: 10,
    November: 11,
    December: 12
}

exports.readMetaDataFromExcel = (workbook, sheetName) => {
    try {
        const worksheet = workbook.getWorksheet(sheetName)

        if (!worksheet) {
            throw new Error(`Worksheet "${sheetName}" not found in the Excel file.`)
        }

        const metaData = []
        const projects = []

        // Iterate through each row in the worksheet
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber > 1) {
                const project = row.getCell(1).value.toString().trim()
                const subProject = row.getCell(2).value.toString().trim()

                // Skip header row
                metaData.push({
                    id: rowNumber - 1,
                    project,
                    subProject
                })

                if (!projects.includes(project)) {
                    projects.push(project)
                }
            }
        })

        return { metaData, projects }
    } catch (err) {
        throw err
    }
}

exports.readOverviewDataFromExcel = async (workbook, projects, isDetailed, filter) => {
    try {
        //data to be return
        let overviewData = []

        let subProjects = []
        const allOverview = []

        // selecting the current project and subproject name
        let projectName = filter.projectName
        let subProjectName = filter.subProjectName

        // object to push on overviewData for total count row
        const totalData = {
            subProject: 'Total',
            deliverables: 0,
            views: 0,
            reach: 0,
            likes: 0,
            comments: 0,
            followers: 0,
            engagement: 0
        }
        // pushing the filtered projects into subproject as per filter
        if (projectName === 'ALL' && subProjectName === 'ALL') {
            subProjects = projects
        } else if (subProjectName === 'ALL') {
            const selectedProjectArray = projects.filter((item) => item.project === projectName)
            subProjects = selectedProjectArray
        } else {
            subProjects.push({ subProject: subProjectName, project: projectName })
        }

        // fetching data from xlsx from each sheet from sheetname

        for (let i = 0; i < subProjects.length; i++) {
            const currentSheetName = subProjects[i].subProject
            const currentSheet = workbook.getWorksheet(currentSheetName)

            const projectOverviewData = {
                subProject: subProjects[i].subProject,
                project: subProjects[i].project,
                deliverables: 0,
                views: 0,
                reach: 0,
                likes: 0,
                comments: 0,
                followers: 0,
                engagement: 0
            }

            //reading each row of sheet
            currentSheet.eachRow((row, rowNumber) => {
                if (rowNumber > 1) {
                    const value = row

                    projectOverviewData.followers += getCellValue(value.getCell(4).value)
                    projectOverviewData.deliverables += value.getCell(2).value ? 1 : 0

                    projectOverviewData.views += getCellValue(value.getCell(8).value)
                    projectOverviewData.reach += getCellValue(value.getCell(9).value)
                    projectOverviewData.likes += getCellValue(value.getCell(10).value)
                    projectOverviewData.comments += getCellValue(value.getCell(11).value)
                    projectOverviewData.engagement += getCellValue(value.getCell(12).value)

                    // total data

                    totalData.deliverables += value.getCell(2).value ? 1 : 0
                    totalData.followers += getCellValue(value.getCell(4).value)
                    totalData.views += getCellValue(value.getCell(8).value)
                    totalData.reach += getCellValue(value.getCell(9).value)
                    totalData.likes += getCellValue(value.getCell(10).value)
                    totalData.comments += getCellValue(value.getCell(11).value)
                    totalData.engagement += getCellValue(value.getCell(12).value)
                }
            })
            console.log(projectOverviewData, overviewData)
            overviewData.push(projectOverviewData)
            console.log(overviewData)
        }

        // if ALL projects are selected then need to change the data formate
        for (let i = 0; i < overviewData.length; i++) {
            let findDataindex = allOverview.findIndex((item) => item.project === overviewData[i].project)

            // if data not found
            if (findDataindex === -1) {
                allOverview.push({
                    project: overviewData[i].project,
                    subProject: overviewData[i].subProject,
                    deliverables: overviewData[i].deliverables,

                    followers: overviewData[i].followers,
                    reach: overviewData[i].reach,
                    views: overviewData[i].views,
                    likes: overviewData[i].likes,
                    comments: overviewData[i].comments,
                    engagement: overviewData[i].engagement
                })
            }
            // if data found then need to update the data
            else {
                allOverview[findDataindex].deliverables += overviewData[i].deliverables
                allOverview[findDataindex].followers += overviewData[i].followers
                allOverview[findDataindex].views += overviewData[i].views
                allOverview[findDataindex].likes += overviewData[i].likes
                allOverview[findDataindex].comments += overviewData[i].comments
                allOverview[findDataindex].reach += overviewData[i].reach
                allOverview[findDataindex].engagement += overviewData[i].engagement
            }
        }

        // for (let i = 0; i < allOverview.length; i++) {
        //     allOverview[i].engagementRate = (allOverview[i].interactions / allOverview[i].followers) * 100
        // }
        // for (let i = 0; i < overviewData.length; i++) {
        //     overviewData[i].engagementRate = (overviewData[i].interactions / overviewData[i].followers) * 100
        // }

        // totalData.engagementRate = (totalData.interactions / totalData.followers) * 100

        // changing data for ALL Project name
        if (projectName === 'ALL' && subProjectName === 'ALL') {
            overviewData = allOverview
        }
        overviewData.push(totalData)

        return overviewData
    } catch (err) {
        throw err
    }
}

exports.readInsightsDataFromExcel = async (workbook, filter, isDetailed, metaData) => {
    try {
        let summaryData = {
            deliverables: 0,
            followers: 0,
            views: 0,
            reach: 0,
            likes: 0,
            comments: 0,
            engagement: 0
        }

        // growth related data
        const growthData = []
        const pieChartData = []

        let subProjects = []
        let insights = []
        let campaignNames = []

        let projectName = filter.projectName
        let subProjectName = filter.subProjectName
        let selectedCampaignMonth = filter.selectedCampaignMonth

        let datesArray = []
        if (filter.dates) {
            const startDate = filter.dates.split('-')[0].trim()
            const endDate = filter.dates.split('-')[1].trim()

            const sDate = moment(startDate, 'DD/MM/YYYY')
            const eDate = moment(endDate, 'DD/MM/YYYY')

            datesArray = [...getDates(sDate, eDate)]
        }

        if (projectName === 'ALL' && subProjectName === 'ALL') {
            subProjects = metaData
        } else if (subProjectName === 'ALL') {
            const selectedProjectArray = metaData.filter((item) => item.project === projectName)
            subProjects = selectedProjectArray
        } else {
            subProjects.push({ subProject: subProjectName, project: projectName })
        }

        const doCounting = (value, i, date, formattedDate) => {
            // Summary Data

            summaryData.deliverables += value.getCell(2).value ? 1 : 0
            summaryData.followers += getCellValue(value.getCell(4).value)

            summaryData.views += getCellValue(value.getCell(8).value)
            summaryData.reach += getCellValue(value.getCell(9).value)
            summaryData.likes += getCellValue(value.getCell(10).value)
            summaryData.comments += getCellValue(value.getCell(11).value)
            summaryData.engagement += getCellValue(value.getCell(12).value)

            // Performance Growth Data
            if (date) {
                const existingDataIndex = growthData.findIndex((item) => item.date === formattedDate)
                if (existingDataIndex === -1) {
                    growthData.push({ date: formattedDate, views: getCellValue(value.getCell(8).value) })
                } else {
                    growthData[existingDataIndex].views += getCellValue(value.getCell(8).value)
                }
            }

            // Top Performing Post Pie Chart
            pieChartData.push({
                reelLink: value.getCell(6).value?.hyperlink || '#',
                views: getCellValue(value.getCell(8).value),
                project: subProjects[i].subProject
            })

            // Detailed Data
            if (isDetailed) {
                //for detailed table insights
                insights.push({
                    name: value.getCell(2).value || '',
                    postingDate: formattedDate || '',
                    profileLink: value.getCell(3).value?.text || '',
                    followers: getCellValue(value.getCell(4).value),
                    contentLink: value.getCell(6).value?.text || '',
                    deliverable: value.getCell(7).value || '',
                    views: getCellValue(value.getCell(8).value),
                    reach: getCellValue(value.getCell(9).value),
                    likes: getCellValue(value.getCell(10).value),
                    comments: getCellValue(value.getCell(11).value),
                    engagement: getCellValue(value.getCell(12).value)
                })
            }
            // }
        }
        // fetching selected sheets data
        for (let i = 0; i < subProjects.length; i++) {
            const currentSheetName = subProjects[i].subProject

            const currentSheet = workbook.getWorksheet(currentSheetName)

            currentSheet.eachRow((row, rowNumber) => {
                if (rowNumber > 1) {
                    // for (let j = 0; j < rows.length; j++) {
                    const value = row

                    const date = value.getCell(5).value // Assuming posting date is in column 'J'
                    const formattedDate = typeof date !== 'string' ? moment(date).format('DD/MM/YYYY') : date

                    const campaignName = value.getCell(13).value // Assuming posting date is in column 'M
                    if (campaignName && !campaignNames.includes(campaignName)) {
                        campaignNames.push(campaignName)
                    }

                    if (datesArray.length > 0) {
                        if (datesArray.includes(formattedDate)) {
                            doCounting(value, i, date, formattedDate)
                        }
                    } else if (campaignName && selectedCampaignMonth !== 'ALL') {
                        if (campaignName === selectedCampaignMonth) {
                            doCounting(value, i, date, formattedDate)
                        }
                    } else {
                        doCounting(value, i, date, formattedDate)
                    }
                }
            })
        }

        // Sort the performance growth data by date
        const growthDataArray = growthData
            .filter((item) => item.date && item.date.trim() !== '')
            .sort((a, b) => {
                const dateA = new Date(a.date.split('/').reverse().join('/'))
                const dateB = new Date(b.date.split('/').reverse().join('/'))
                return dateA - dateB
            })

        // Sort pie chart data by views
        const sortedByViewsArray = [...pieChartData].sort((a, b) => b.views - a.views).slice(0, 10)

        // Sort Campaign Months
        // campaignMonths.sort(function (a, b) {
        //     var aParts = a.split(' ')
        //     var bParts = b.split(' ')

        //     // Compare years
        //     var yearComparison = parseInt(aParts[1]) - parseInt(bParts[1])
        //     if (yearComparison !== 0) {
        //         return yearComparison
        //     }

        //     // If years are the same, compare months
        //     var monthComparison = months[aParts[0]] - months[bParts[0]]
        //     if (monthComparison !== 0) {
        //         return monthComparison
        //     }

        //     // If months are the same, compare years as strings (lexicographically)
        //     return aParts[1].localeCompare(bParts[1])
        // })

        return { campaignNames, summaryData, insights, growthDataArray, sortedByViewsArray }
    } catch (err) {
        throw err
    }
}
