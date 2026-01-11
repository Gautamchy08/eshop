/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import express from 'express';
import cors from 'cors';
import proxy from 'express-http-proxy'
import morgan from 'morgan';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import initializeConfig from './libs/initializeSizeConfig';


const app = express();

app.use(cors(
  {
    origin : ['http://localhost:3000'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }
));
  
app.use(morgan('dev'));
app.use(express.json({limit: '100mb'}));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));
app.use(cookieParser());
app.set('trust proxy', 1);


// Apply rate limiting to all requests

 const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max : (req:any)=>(req.user?.id ? 1000 : 100), // 1000 requests per 15 minutes for logged in users, 100 for guests

  message : {error : 'Too many requests, please try again later.'},
  standardHeaders: true,
  legacyHeaders: true,
  keyGenerator: (req:any) => ipKeyGenerator(req.ip)

});

app.use(limiter);


app.get('/gateway-health', (req, res) => {
  res.send({ message: 'Welcome to api-gateway!' });
});
app.use("/product", proxy('http://localhost:6002/')); // Proxy to another service
app.use("/", proxy('http://localhost:6001/')); // Proxy to another service

const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}/api`);

try {
 initializeConfig();
 console.log('site config initialize successfully');  
} catch (error) {
  
  console.log('failed to initialize site config',error);
}
});
server.on('error', console.error);
