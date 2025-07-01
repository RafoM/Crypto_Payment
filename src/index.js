
const app = require('./app');
const { init } = require('./models/sequelize');

const PORT = process.env.PORT || 3000;

init().then(() => {
  app.listen(PORT, '0.0.0.0',() => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize database', err);
});
