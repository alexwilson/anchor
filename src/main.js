const express = require('express')
const expressHandlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const cors = require('cors')
const moment = require('moment')

const app = express()
const router = new express.Router()

const index = require('./routes/index')
const docs = require('./routes/docs')
const news = require('./routes/news')
const apiai = require('./routes/apiai')

app.engine('.html', expressHandlebars({
    extname: '.html',
    defaultLayout: 'main',
    helpers: {
        formatDate: date => moment(date).calendar(),
        responsiveImage: url => `https://responsiveimages.io/v1/images/${encodeURIComponent(url)}`
    }
}))
app.set('view engine', '.html')

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

router.get('/', index)
router.get('/v1/news', news)
router.get('/v1/docs', docs)
router.post('/v1/webook/api.ai', apiai)
router.get('/*', (req, res) => {
  res.redirect('/v1/docs')
})

app.use(router)
const listener = app.listen(process.env.PORT || 3000, err => {
    if (err) throw err
    const {address,port} = listener.address()
    console.log(`Serving on ${address} ${port}.`)
})
