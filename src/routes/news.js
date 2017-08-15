const fetch = require('node-fetch')
const article = require('../entity/article')
const promiseUtils = require('../utils/promises')
const _ = require('lodash')

function news(req, res) {

    const thumbnailFromEntry = entry => {
        let url
        if (entry.thumbnail) url = entry.thumbnail.url
        if (entry.visual) url = entry.visual.url
        return url
    }

    const sourceLinkFromEntry = entry => {
        const alternate = entry.alternate || []
        return alternate.reduce(
            (previous, current) => (current.type === 'text/html') ? current.href : previous, null
        )
    }

    const findImagesFromGraph = articles => new Promise((resolve, reject) => {
            const articlesWithoutImages = Array.from(articles.values()).filter(article => article.thumbnail !== null)
            Promise.all(_.chunk(articlesWithoutImages, 50).map(batch =>
                fetch(`https://graph.facebook.com/?fields=og_object{image}&ids=${batch.map(article => article.link).join(',')}`)
                    .then(res => res.json())
            ))
            .then(promiseUtils.concatResponse)
            .then(graphObjects => {
                Object.keys(graphObjects).forEach(node => {
                    const graphObject = graphObjects[node]['og_object']
                    const image = graphObject.image.reduce((previous, current) => (previous.width > current.width) ? previous : current, {width: 0, url: null})
                    if (image.url !== null) articles.set(node, articles.get(node).withThumbnail(image.url))
                })
                return articles
            })
            .then(resolve)
            .catch(reject)
    })

    const feedlyEntriesFromEntryIds = entryIds => fetch('https://feedly.com/v3/entries/.mget', {
        method: 'POST',
        body: JSON.stringify(entryIds)
    })

    const feedlyIdsForStream = url => fetch(`https://feedly.com/v3/streams/ids?count=100&streamId=feed/${encodeURIComponent(url)}`)

    const allSourcesViaFeedly = sources => 
        Promise.all(sources.map(source => feedlyIdsForStream(source).then(res => res.json())))
        .then(promiseUtils.concatResponse)
        .then(response => response.ids)

    const sources = [
        'https://ax.gy/feed.xml',
        'https://www.economist.com/feeds/print-sections/all/all.xml',
        'https://www.ft.com/?format=rss&edition=uk'
    ]

    return allSourcesViaFeedly(sources)
        .then(feedlyEntriesFromEntryIds)
        .then(response => response.json())
        .then(entries => entries.reduce((map, entry) => {
            const link = sourceLinkFromEntry(entry)
            map.set(link, article.newArticle()
                .withTitle(entry.title)
                .withLink(link)
                .withThumbnail(thumbnailFromEntry(entry))
                .withSummary(entry.summary.content)
                .withDate(new Date(entry.published))
                .withSource('Financial Times')
            )
            return map
        }, new Map()
        ))
        .then(findImagesFromGraph)
        .then(articles => Array.from(articles.values()))
        .then(articles => {
            const lastUpdated = Date.now()
            res.render('news', {
                title: 'River Of News',
                lastUpdated,
                articles
            })
        })
        .catch(console.error)
}

module.exports = news
