const axios = require('axios')
const fs = require('fs')
const path = require('path')
const logger = require('./logger')

exports.updateReport = async () => {
    try {
        // Example usage
        const googleSheetUrl =
            'https://docs.google.com/spreadsheets/d/e/2PACX-1vTuwZiZOms5O_jv2-WqUBLy-s5OhKGuEOBMfike8b0X3-qjpmEberQD5xta9i5Ex2ZUIu3TLFDKx_OL/pub?output=xlsx'
        const folderPath = './insight'
        const fileName = 'report.xlsx'

        downloadGoogleSheet(googleSheetUrl, folderPath, fileName)
    } catch (err) {
        throw err
    }
}

async function downloadGoogleSheet(url, folderPath, fileName) {
    try {
        // Make GET request to download the Google Sheet
        const response = await axios.get(url, {
            responseType: 'arraybuffer' // This ensures response is treated as binary
        })

        // Create folder if it doesn't exist
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true })
        }

        // Write the downloaded content to a file
        const filePath = path.join(folderPath, fileName)
        fs.writeFileSync(filePath, response.data)

        logger.info(`Google Sheet downloaded and saved at: ${filePath}`)
    } catch (error) {
        logger.error(`Error in downloding the google sheet`)
        throw error
    }
}
