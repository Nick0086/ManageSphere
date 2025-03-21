import express from 'express';
import cors from 'cors'
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit'

import userRoutes from './routes/user.routes.js'
import authRoutes from './routes/auth.routes.js'
import menuRoutes from './routes/menu.routes.js'
import tableRoutes from './routes/tables-qrcode.routes.js'
import customerMenuRoutes from './routes/customer-menu.routes.js'
import orderRoutes from './routes/order.routes.js'

const limiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 300 // limit each IP to 300 requests per windowMs
})

const app = express();

app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173', 'http://localhost:8080', 'http://localhost:5174', 'http://192.168.1.10:5173', process.env.FRONTEND_DOMAIN],
    credentials: true
}))

app.use(express.json())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
// app.use(limiter)


app.use((req, res, next) => {
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
});

//login api
app.use('/v1/user', userRoutes);

// auth api
app.use('/v1/auth', authRoutes);

// menu api
app.use('/v1/menu', menuRoutes);

// table-qr code api
app.use('/v1/tables', tableRoutes);

// menu viwer
app.use('/v1/customer-menu', customerMenuRoutes);

// order
app.use('/v1/order', orderRoutes)

const PORT = process.env.PORT || 3002;

const server = app.listen(PORT, () => {
    console.log(`${new Date().toLocaleString()} - Server listening on port ${PORT}`);
});