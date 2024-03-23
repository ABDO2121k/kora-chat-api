import express from "express";
import dotenv from "dotenv";
import http from 'http'
import chatRouter from './routes/chat.route.js'
import morgan from "morgan";
import cors from 'cors'
import bodyParser from "body-parser";

dotenv.config();

const app = express();
app.use(express.json())
app.use(morgan("dev"))
const domaine = process.env.DOMAIN_NAME;
app.use(cors({ origin: domaine, credentials: true }));
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));

const server=http.createServer(app)

//routers
app.use('/api',chatRouter)
// end routers

server.listen(process.env.PORT ? process.env.PORT : 5000, () => {
  console.log("connected in port 8000");
});
