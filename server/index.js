import express, { json } from "express";
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { Server } from "socket.io";
import { createServer } from "http";
import handleLoginController  from "./controller/handleLoginController.js";
import handleVerificationController from "./controller/handleVerificationController.js";
import handleLogout from "./controller/handleLogout.js";
import handleTrading from "./controller/handleTrading.js";
import handlePrevDayClose from "./helper/handlePrevDayLow.js";
import handleStopLoss from "./controller/handleStopLoss.js";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: 'http://127.0.0.1:5173', // Set the actual origin of your client application
    methods: ['GET', 'POST'],
    credentials: true, // Enable credentials (cookies, authorization headers)
  },
});
app.use(cors());
app.use(json())
app.use(cookieParser());


const PORT = 8080  


app.get('/api/auth', handleLoginController)
app.post ('/api/verify-access-code', handleVerificationController)
app.post ('/api/logout', handleLogout)
app.post ('/api/start-trading', handleTrading(io))
app.get("/api/handle-get-prev-day-close", handlePrevDayClose)
app.post("/api/handle-stoploss", handleStopLoss)
httpServer.listen(PORT, () => {
    console.log(`The server is running on ${PORT}`)
})