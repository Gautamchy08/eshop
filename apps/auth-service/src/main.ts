import swaggerUi from 'swagger-ui-express';
import { errorMiddleware } from '../../../packages/error-handler/error-middleware';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import router from './routes/auth.router';
// @ts-ignore
import swaggerDocument from './swagger-output.json';

const port = process.env.PORT || 6001;

const app = express();


app.use(express.json());
app.use(cookieParser());
app.use(cors(
  {
    origin : ['http://localhost:3000'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }
)); 

app.get('/', (req, res) => {
  res.send({ message: 'Hello this is gautam using proxy' });
});

// Swagger documentation route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/docs-json', (req, res) => {
  res.json(swaggerDocument);
});

// routes going here

app.use('/api',router)

// Error middleware MUST be registered after all routes
app.use(errorMiddleware);

const server = app.listen(port,()=>{
  console.log(`Auth Service listening on port http://localhost:${port}/api/`);
  console.log(`api docs available at http://localhost:${port}/api-docs` )
})

server.on('error', (err)=>{
  console.error('Server error:', err); 
})
