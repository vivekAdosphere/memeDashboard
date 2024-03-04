const { hashPassword, generatePassword } = require('../services/utilities')
const adminUser = require('../models/adminUser')
const logger = require('../services/logger')
const fs = require('fs')
const config = require('../configs/configs')

const writeFile = (data) => {
    fs.writeFile('creds.txt', data, (err) => {
        if (err) console.log(err)
        else {
            console.log('File written successfully\n')
            console.log('The written has the following contents:')
        }
    })
}

// const cities = config.CITIES

module.exports = async () => {
    try {
        let seedStatus = false
        let credentials = ''

        const users = [
            // {
            //     name: 'Sauraj',
            //     email: 'sauraj@reelix.co',
            //     password: generatePassword('Sauraj'),
            //     role: 'admin'
            // },
            // {
            //     name: 'Ayushmaan',
            //     email: 'ayushmaan@reelix.co',
            //     password: generatePassword('Ayushmaan'),
            //     role: 'admin'
            // },
            // {
            //     name: 'Shivani',
            //     email: 'shivani@reelix.co',
            //     password: generatePassword('Shivani'),
            //     role: 'admin'
            // },
            // {
            //     name: 'Rutwa',
            //     email: 'rutwa@reelix.co',
            //     password: generatePassword('Rutwa'),
            //     role: 'admin'
            // },
            // {
            //     name: 'Mrunali',
            //     email: 'mrunali@reelix.co',
            //     password: generatePassword('Mrunali'),
            //     role: 'admin'
            // },
            // {
            //     name: 'Chintan',
            //     email: 'chintan@reelix.co',
            //     password: generatePassword('Chintan'),
            //     role: 'admin'
            // },
            // {
            //     name: 'Vijay',
            //     email: 'vijay@reelix.co',
            //     password: generatePassword('Vijay'),
            //     role: 'admin'
            // },
            // {
            //     name: 'Abhijit',
            //     email: 'abhijit@reelix.co',
            //     password: generatePassword('Abhijit'),
            //     role: 'admin'
            // },
            // {
            //     name: 'Shikha',
            //     email: 'shikha@reelix.co',
            //     password: generatePassword('Shikha'),
            //     role: 'admin'
            // },
            {
                name: 'Admin 1',
                email: 'admin1@reelix.co',
                password: generatePassword('Admin1'),
                role: 'admin'
            },
            {
                name: 'Admin 2',
                email: 'admin2@reelix.co',
                password: generatePassword('Admin2'),
                role: 'admin'
            },
            {
                name: 'Admin 3',
                email: 'admin3@reelix.co',
                password: generatePassword('Admin3'),
                role: 'admin'
            },
            {
                name: 'Admin 4',
                email: 'admin4@reelix.co',
                password: generatePassword('Admin4'),
                role: 'admin'
            },
            // {
            //     name: 'Ados 1',
            //     email: 'ados1@reelix.co',
            //     password: generatePassword('Ados1'),
            //     role: 'admin'
            // },
            // {
            //     name: 'Ados 2',
            //     email: 'ados2@reelix.co',
            //     password: generatePassword('Ados2'),
            //     role: 'admin'
            // },
            // {
            //     name: 'Ados 3',
            //     email: 'ados3@reelix.co',
            //     password: generatePassword('Ados3'),
            //     role: 'admin'
            // },
            // {
            //     name: 'Ados 4',
            //     email: 'ados4@reelix.co',
            //     password: generatePassword('Ados4'),
            //     role: 'admin'
            // },
            {
                name: 'Super Admin',
                email: 'sadmin@reelix.co',
                password: generatePassword('Sadmin'),
                role: 'super-admin'
            }
        ]

        for (let i = 0; i < users.length; i++) {
            const isExist = await adminUser.exists({ email: users[i].email })

            if (!isExist) {
                let currentUser = users[i]
                credentials += `Email Address: ${users[i].email}\nPassword: ${users[i].password}\n\n`
                currentUser.password = await hashPassword(currentUser.password)
                await adminUser.create(currentUser)
                seedStatus = true
            }

            if (seedStatus && i === users.length - 1) {
                writeFile(credentials)
                logger.info('Seed Complete')
            }
        }
    } catch (err) {
        logger.error(`Seed error --> ${err.stack}`)
    }
}
