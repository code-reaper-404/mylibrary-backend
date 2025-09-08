const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

const libraryRoutes = require('./routes/library.Routes')
const authRoutes = require('./routes/auth.Routes')
const historyRoutes = require('./routes/history.Routes')

const app = express();

// Middleware
app.use(cors({ origin: ["http://localhost:5173","http://localhost:5174","https://myown-library.netlify.app",], credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/library", libraryRoutes);
app.use("/api/history", historyRoutes);

app.get("/", (req, res) => res.send(" MyLibrary API running"));

module.exports = app;
