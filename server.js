import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import chatRouter from "./src/chatRouter.js";


console.log("[INIT] Starting server setup");

const app = express();

console.log("[MIDDLEWARE] Registering JSON parser");
app.use(express.json());

console.log("[MIDDLEWARE] Registering CORS");
app.use(cors());

app.get('/', (req, res) => {
    console.log("[ROUTE HIT] GET /");
    res.send('back end is running');
});

console.log("[ROUTER] Mounting /api router");
app.use('/chat', (req, res, next) => {
    console.log(`[API ENTRY] ${req.method} ${req.originalUrl}`);
    next();
}, chatRouter);

// start server
const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`[SERVER STARTED] Listening on port ${port}`);
});

// catch unexpected errors
process.on("uncaughtException", (err) => {
    console.error("[UNCAUGHT EXCEPTION]", err);
});

process.on("unhandledRejection", (reason, promise) => {
    console.error("[UNHANDLED REJECTION]", reason);
});


