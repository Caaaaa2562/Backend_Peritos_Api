const express = require('express');
const morgan = require('morgan');
const peritosRoutes = require('./routes/peritos.routes');
const { notFound, errorHandler } = require('./middlewares/errorHandler');

const app = express();

app.use(morgan('dev'));
app.use(express.json());

app.use('/api/v1/peritos', peritosRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
