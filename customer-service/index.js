const express = require('express');
const rateLimit = require('express-rate-limit');
const app = express();

app.use(express.json());

let customers = [];

// jsonwebtoken
const jwt = require('jsonwebtoken');

function generateToken(user) {
    const payload = {
        id: user.id,
        role: user.role
    };
    return jwt.sign(payload, 'yourSecretKey', { expiresIn: '1h' });
}

let limiter = rateLimit({
    max: 5,
    windowMs: 10 * 60 * 1000,
    message: 'Too many requests.'
});

app.use('/api', limiter);

// Login Endpoint
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    const user = {
        id: 1,
        username: 'test',
        password: 'password123',
        role: 'admin'
    }

    if (username === user.username && password === user.password) {
        const token = generateToken(user);
        return res.json({ token });
    } else {
        return res.status(401).json({ message: 'Invalid username or password' });
    }
})

// Route for Creating a Customer
app.post('/customers', (req, res) => {
    try {
        const customerId = Date.now();
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Name is required!'});
        }

        const customer = {
            customerId,
            name
        };

        customers.push(customer);
        res.status(201).json({ message: 'Successfully added customer!'});

    } catch (error) {
        res.status(500).json({ message: 'Could Not Create Customer'});
    }
})

// (Optional Route) Route for Retrieving all customers
app.get('/customers', limiter, (req, res) => {
    try {
        if (!customers) {
            return res.status(400).json({ message: 'Customers Do Not Exist'});
        }

        res.json(customers);

    } catch (error) {
        res.status(500).json({ message: 'Could Not Retrieve Customers'});
    }
})


// Route for Retrieving Customer Details by ID
app.get('/customers/:customerId', (req, res) => {
    try {
        const customer = customers.find(p => p.customerId == req.params.customerId);

        if (!customer) {
            return res.status(404).json({ message: 'Customer not Found'});
        }

        res.send(customer);

    } catch (error) {
        res.status(500).json({ message: 'Could Not Retrieve Customer'});
    }
})

// Route for Updating a Customer by ID
app.put('/customers/:customerId', (req, res) => {
    try {
        const customer = customers.find(p => p.customerId == req.params.customerId);

        if (!customer) {
            return res.status(400).json({ message: 'Customer not Found' });
        }

        Object.assign(customer, req.body);
        res.status(200).json({ message: 'Successfully Updated Customer' });

    } catch (error) {
        res.status(500).json({ message: 'Could Not Update Customer' });
    }
})

// Route for Deleting a Customer by ID
app.delete('/customers/:customerId', (req, res) => {
    try {
        customers = customers.filter(p => p.customerId != req.params.customerId);
        res.status(200).json({ message: 'Successfully Deleted Customer'});
    } catch (error) {
        res.status(500).json({ message: 'Could Not Delete Customer'});
    }
})

app.listen(3002, () => {
    console.log('Customer Service is running on port 3002');
})
