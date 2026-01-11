import express from 'express';
import './jobs/product-crone-job';  
import swaggerUi from 'swagger-ui-express';
import { errorMiddleware } from '../../../packages/error-handler/error-middleware';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import router from './routes/product.route';
import swaggerDocument from './swagger-output.json';
const port = process.env.PORT || 6002;

const app = express();


app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));
app.use(cookieParser());
app.use(cors(
  {
    origin : ['http://localhost:3000'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }
)); 

app.get('/', (req, res) => {
  res.send({ message: 'Hello this is gautam on Product API' });
});

// Swagger documentation route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/docs-json', (req, res) => {
  res.json(swaggerDocument);
});

// routes going here

app.use('/api', router)

// Error middleware MUST be registered after all routes
app.use(errorMiddleware);

const server = app.listen(port,()=>{
  console.log(`Product Service listening on port http://localhost:${port}/product/`);
  console.log(`api docs available at http://localhost:${port}/api-docs` )
})

server.on('error', (err)=>{
  console.error('Server error:', err); 
})
