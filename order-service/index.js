const https = require('https');
const fs = require('fs');
const express = require('express');
const axios = require('axios');
const app = express();
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

app.use(helmet());
app.use(express.json());

let orders = [];

const sslOptions = {
    key: fs.readFileSync('D:/Microservice-API_Exercise/server.key'),
    cert: fs.readFileSync('D:/Microservice-API_Exercise/server.cert')
}

// Security HTTP Headers
app.use(express.json({
    limit: '20kb'
}));

// Rate Limiter Middleware
let limiter = rateLimit({
    max: 5,
    windowMs: 10 * 60 * 1000,
    message: 'You have exceeded the maximum number of allowed requests. Please try again later.'
});

app.use('/api', limiter);

// JWT Validation Middleware
function authenticateToken(req, res, next) {

    try {
        const token = req.headers['authorization']?.split(' ')[1];

        if (!token) {
            return res.sendStatus(401);
        }

        jwt.verify(token, 'yourSecretKey', (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }
            req.user = user;
            next();
        })

    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error'});
    }
}

// RBAC (Role-Based Access Control) Middleware
function authorizeRoles(...allowedRoles) {
    return (req, res, next) => {
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Access Denied' });
        }
        next();
    }
}

// axiosInstance to allow requests with self-signed certificates 
const axiosInstance = axios.create({
    httpsAgent: new https.Agent({  
        rejectUnauthorized: false  // Disable SSL validation for self-signed certs
    })
});

// Route for Creating an Order
app.post('/orders', authenticateToken, limiter, async (req, res) => {
    console.log(req.body);
    try {
        const { customerId, productId } = req.body;

        const token = req.headers['authorization'];

        const customerResponse = await axiosInstance.get(`https://localhost:3002/customers/${customerId}`, {
            headers: {
                'Authorization': token 
            }
        });
        const customerName = customerResponse.data.name;
        const customerAge = customerResponse.data.age;
        console.log('Customer Response:', customerResponse.data);

        const productResponse = await axiosInstance.get(`https://localhost:3001/products/${productId}`, {
            headers: {
                'Authorization': token 
            }
        });
        const productName = productResponse.data.name;
        const productPrice = productResponse.data.price;
        console.log('Product Response:', productResponse.data);

        const order = { orderId: Date.now(), customerId, productId, customerName, productName, customerAge, productPrice };
        orders.push(order);
        res.status(200).send(order);

    } catch (error) {
        console.error('Error creating order:', error);
        res.status(400).send('Invalid Customer or Product');
    }
});


// Route for Retrieving Orders by ID
app.get('/orders/:orderId', authenticateToken, limiter, (req, res) => {
    try {
        const order = orders.find(o => o.orderId == req.params.orderId);

        if (!order) {
            return res.status(400).json({ message: 'Order Does Not Exist'});
        }

        res.send(order);

    } catch (error) {
        res.status(500).json({ message: 'Could Not Retrieve Order' });
    }
})

// Route for Retrieving all Orders 
app.get('/orders', authenticateToken, authorizeRoles('admin'), limiter, (req, res) => {
    try {
        if (!orders) {
            return res.status(400).json({ message: 'Orders Do Not Exist' });
        }

        res.json(orders);

    } catch (error) {
        res.status(500).json({ message: 'Could Not Retrieve Orders' });
    }
})

// Route for Updating an Order by Id
app.put('/orders/:orderId', authenticateToken, limiter, async (req, res) => {
    try {
        const order = orders.find(o => o.orderId == req.params.orderId);

        if (!order) {
            return res.status(400).json({ message: 'Order Does Not Exist'});
        }

        const { customerId, productId } = req.body; 

        if (productId && productId !== order.productId) {
            const productResponse = await axios.get(`http://localhost:3001/products/${productId}`);
            order.productId = productId;
            order.productName = productResponse.data.name;
            order.productPrice = productResponse.data.price; 
        }
        
        if (customerId && customerId !== order.customerId) {
            const customerResponse = await axios.get(`http://localhost:3002/customers/${customerId}`);
            order.customerId = customerId;
            order.customerName = customerResponse.data.name;
            order.customerAge = customerResponse.data.age; 
        }

        Object.assign(order, req.body);
        res.status(200).json({ message: 'Successfully Updated Order' });

    } catch (error) {
        res.status(500).json({ message: ''})
    }
})

// Route for Deleting an Order by Id
app.delete('/orders/:orderId', authenticateToken, authorizeRoles('admin'), limiter, (req, res) => {
    try {
        orders = orders.filter(o => o.orderId != req.params.orderId);
        res.status(200).json({ message: 'Successfully Deleted Order' });
    } catch (error) {
        res.status(500).json({ message: 'Could Not Delete Order' });
    }
})

// Creating HTTPS server
https.createServer(sslOptions, app).listen(3003, () => {
    console.log('Order Service running on HTTPS port 3003');
});