class Article {

    constructor() {
        this.title = undefined
        this.summary = undefined
        this.date = undefined
        this.link = undefined
        this.thumbnail = undefined
        this.source = undefined
    }

    static newArticle() {
        return new Article()
    }

    withTitle(title) {
        this.title = title
        return this
    }

    withSummary(summary) {
        this.summary = summary
        return this
    }

    withDate(date) {
        this.date = date
        return this
    }

    withLink(link) {
        this.link = link
        return this
    }

    withThumbnail(thumbnail) {
        this.thumbnail = thumbnail
        return this
    }

    withSource(source) {
        this.source = source
        return this
    }
}

module.exports = Article