const router = require('express').Router()

router.get('/', (req, res) => {
    return res.json({
        version: '1',
        author: 'radiocity'
    })
})

module.exports = router
