const app = require('../app');

app.get('/health', (req, res) => {
  res.send('ok');
});
