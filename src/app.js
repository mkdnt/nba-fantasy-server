require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const { CLIENT_ORIGIN } = require("./config");
const helmet = require("helmet");
const { NODE_ENV } = require("./config");
const postRouter = require('./post/post-router')
const errorHandler = require('./errorHandler');
const validateBearerToken = require("./validateBearerToken");
const morganOption = NODE_ENV === "production" ? "tiny" : "common";

const app = express();
app.use(morgan(morganOption));
app.use(helmet());
app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(validateBearerToken);
app.use('/api/posts', postRouter);
app.use(errorHandler);

module.exports = app;
