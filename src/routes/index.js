function index(req, res) {
  res.render('index', {
    title: 'Anchor News API'
  })
}

module.exports = index
