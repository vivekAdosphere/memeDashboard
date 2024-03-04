// const getSheetRows = async (doc, sheetName) => {
//     try {
//         const sheet = doc.sheetsByTitle[sheetName]
//         const data = await sheet.getRows()
//         return data
//     } catch (err) {
//         throw err
//     }
// }

// // Reading Meta Data Sheet
// const readMetaData = (rows) => {
//     try {
//         const metaData = []
//         const projects = []

//         rows.forEach((value, index) => {
//             metaData.push({
//                 id: index,
//                 project: value.get('Project').toString().trim(),
//                 subProject: value.get('Sub-Project').toString().trim(),
//                 sheetName: value.get('Sheet').toString().trim()
//             })
//             if (!projects.includes(value.get('Project'))) {
//                 projects.push(value.get('Project'))
//             }
//         })

//         return { metaData, projects }
//     } catch (err) {
//         throw err
//     }
// }

// const readOverviewData = async (doc, rows, isDetailed) => {
//     try {
//         const projects = []
//         const overviewData = []
//         // Load the service account key JSON

//         if (!isDetailed) {
//             rows.forEach((value) => {
//                 projects.push({ sheetName: value.get('Sheet'), subProject: value.get('Sub-Project'), project: value.get('Project') })
//             })

//             const promises = []
//             for (let i = 0; i < projects.length; i++) {
//                 let currentProjectSheet = doc.sheetsByTitle[projects[i].sheetName]
//                 promises.push(currentProjectSheet.getRows())
//             }

//             const result = await Promise.allSettled(promises)

//             for (let i = 0; i < result.length; i++) {
//                 if (result[i].status === 'fulfilled') {
//                     // let currentProjectSheet = doc.sheetsByTitle[projects[i].sheetName]
//                     // let currentProjectData = await currentProjectSheet.getRows()

//                     let projectOverviewData = {
//                         subProject: projects[i].subProject,
//                         project: projects[i].project,
//                         sheetName: projects[i].sheetName,
//                         reels: 0,
//                         followers: 0,
//                         likes: 0,
//                         comments: 0,
//                         views: 0,
//                         shares: 0,
//                         accountsReached: 0
//                     }

//                     for (let j = 0; j < result[i].value.length; j++) {
//                         let value = result[i].value[j]

//                         projectOverviewData.followers += Number(value.get('Follower count')) ? Number(value.get('Follower count')) : 0
//                         projectOverviewData.reels += 1
//                         projectOverviewData.likes += Number(value.get('Likes')) ? Number(value.get('Likes')) : 0
//                         projectOverviewData.accountsReached += Number(value.get('Accounts Reached')) ? Number(value.get('Accounts Reached')) : 0
//                         projectOverviewData.comments += Number(value.get('Comments')) ? Number(value.get('Comments')) : 0
//                         projectOverviewData.views += Number(value.get('Views')) ? Number(value.get('Views')) : 0
//                         projectOverviewData.shares += Number(value.get('Shares')) ? Number(value.get('Shares')) : 0
//                     }

//                     overviewData.push(projectOverviewData)
//                 }
//             }
//         }

//         return overviewData
//     } catch (err) {
//         throw err
//     }
// }

// const readInsightsData = async (doc, rows, projectData, isDetailed) => {
//     try {
//         let summaryData = {
//             reels: 0,
//             followers: 0,
//             views: 0,
//             likes: 0,
//             accountsReached: 0,
//             comments: 0,
//             shares: 0
//         }

//         // growth related data
//         const growthData = []
//         const pieChartData = []

//         const subProjects = []
//         let insights = []

//         let projectName = projectData.projectName
//         let subProjectName = projectData.subProjectName

//         // Load the service account key JSON

//         if (projectName === 'ALL' && subProjectName === 'ALL') {
//             rows.forEach((value) => {
//                 subProjects.push({ sheetName: value.get('Sheet'), subProject: value.get('Sub-Project'), project: value.get('Project') })
//             })
//         }
//         if (subProjectName === 'ALL') {
//             rows.forEach((value) => {
//                 if (value.get('Project') === projectName) {
//                     subProjects.push({ sheetName: value.get('Sheet'), subProject: value.get('Sub-Project'), project: value.get('Project') })
//                 }
//             })
//         } else {
//             subProjects.push({ sheetName: subProjectName, subProject: subProjectName, project: projectName })
//         }

//         const promises = []

//         // fetching data
//         for (let i = 0; i < subProjects.length; i++) {
//             let currentProjectSheet = doc.sheetsByTitle[subProjects[i].sheetName]
//             promises.push(currentProjectSheet.getRows())
//         }

//         // Resolving at once
//         const result = await Promise.allSettled(promises)

//         for (let i = 0; i < result.length; i++) {
//             if (result[i].status === 'fulfilled') {
//                 for (let j = 0; j < result[i].value.length; j++) {
//                     let value = result[i].value[j]

//                     summaryData.reels += 1
//                     summaryData.followers += Number(value.get('Follower count')) ? Number(value.get('Follower count')) : 0
//                     summaryData.likes += Number(value.get('Likes')) ? Number(value.get('Likes')) : 0
//                     summaryData.accountsReached += Number(value.get('Accounts Reached')) ? Number(value.get('Accounts Reached')) : 0
//                     summaryData.comments += Number(value.get('Comments')) ? Number(value.get('Comments')) : 0
//                     summaryData.views += Number(value.get('Views')) ? Number(value.get('Views')) : 0
//                     summaryData.shares += Number(value.get('Shares')) ? Number(value.get('Shares')) : 0

//                     // growth data
//                     const date = value.get('Posting Date')
//                     let existingDataIndex = growthData.findIndex((item) => item.date === date)
//                     // if date object is not in array
//                     if (existingDataIndex === -1) {
//                         dataObject = {
//                             date,
//                             views: Number(value.get('Views')) ? Number(value.get('Views')) : 0
//                         }
//                         growthData.push(dataObject)
//                     } else {
//                         growthData[existingDataIndex].views += Number(value.get('Views')) ? Number(value.get('Views')) : 0
//                     }

//                     // pie chart related data
//                     pieChartData.push({
//                         reelLink: value.get('Screenshots/ Link') || '#',
//                         views: Number(value.get('Views')) ? Number(value.get('Views')) : 0,
//                         project: subProjects[i].subProject
//                     })

//                     // if particular filter is applied
//                     if (isDetailed) {
//                         insights.push({
//                             name: value.get('Name'),
//                             postingDate: value.get('Posting Date'),
//                             profileLink: value.get('Instagram Link'),
//                             followers: Number(value.get('Follower count')) ? Number(value.get('Follower count')) : 0,
//                             contentLink: value.get('Screenshots/ Link'),
//                             deliverable: value.get('Deliverable'),
//                             views: Number(value.get('Views')) ? Number(value.get('Views')) : 0,
//                             accountsReached: value.get('Accounts Reached') ? value.get('Accounts Reached') : 0,
//                             likes: value.get('Likes') ? value.get('Likes') : 0,
//                             comments: value.get('Comments') ? value.get('Comments') : 0,
//                             shares: value.get('Shares') ? value.get('Shares') : 0
//                         })
//                     }
//                 }
//             } else {
//                 throw new Error('Sheet reading errors')
//             }
//         }

//         // sort the growth data array by date
//         const growthDataArray = growthData
//             .filter((item) => item.date && item.date.trim() !== '')
//             .sort((a, b) => {
//                 const dateA = new Date(a.date.split('/').reverse().join('/'))
//                 const dateB = new Date(b.date.split('/').reverse().join('/'))
//                 return dateA - dateB
//             })

//         const sortedByViewsArray = [...pieChartData].sort((a, b) => b.views - a.views).slice(0, 10)

//         return { summaryData, insights, growthDataArray, sortedByViewsArray }
//     } catch (err) {
//         throw err
//     }
// }

// module.exports = {
//     readMetaData,
//     readInsightsData,
//     getSheetRows,
//     readOverviewData
// }
