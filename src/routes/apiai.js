const ApiAiApp = require('actions-on-google').ApiAiApp
const fetch = require('node-fetch')
const os = require('os')

const INTENT__NEWS_LATEST = 'news.latest'

function apiaiWebookAction(req, res, next) {
    const app = new ApiAiApp({request: req, response: res})
    app.handleRequest(apiaiWebookHandler)
}

function apiaiWebookHandler(app) {

    const intent = app.getIntent()
    switch (intent) {
        case (INTENT__NEWS_LATEST): {
            fetchLatestNews()
                .then(articles => app.tell(articles.join(`,${os.EOL}`)))
                .catch(console.error)
        }
        default: {
            return
        }
    }
}

function fetchNewsForSpecificProvider(provider) {
    const urlParameters = [
        `source=${provider}`,
        'sortBy=latest',
        `apiKey=${process.env.NEWSAPI_KEY}`
    ]
    return fetch(`https://newsapi.org/v1/articles?${urlParameters.join('&')}`)
        .then(response => response.json())
        .then(response => response.articles.map(article => `${article.title} from ${provider.replace('-', ' ')}`))
        .catch(console.error)
}

function fetchLatestNews() {
    return Promise.all([
        'financial-times',
        'the-economist'
    ].map(fetchNewsForSpecificProvider))
    .then(res => {
        return [].concat(...res)
    })
}

module.exports = apiaiWebookAction