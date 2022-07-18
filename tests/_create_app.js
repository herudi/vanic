function createApp() {
  const body = document.body
  let app = document.getElementById('app')
  if (app) return app
  app = document.createElement('div')
  app.id = 'app'
  body.appendChild(app)
  return app
}

module.exports = createApp;