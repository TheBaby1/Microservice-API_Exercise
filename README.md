# Microservice-API_Exercise
API Activity - IT 3103

# OVERVIEW

This exercise is a demonstration of a microservices architecture with three services:

* Product Service
* Customer Service
* Order Service

# PROJECT STRUCTURE

* product-service/ - service for managing products
* customer-service/ - service for managing customers
* order-service/ - service for managing orders
* secure-gateway/ - configured Express Gateway for API management

# TECHNOLOGIES USED
* Node.js and Express.js for creating REST APIs in the microservices.
* Express Gateway for API Gateway configuration.
* JWT (JSON Web Tokens) for user authentication.
* OpenSSL for generating SSL certificates to secure communication.
* VSCode Terminal for running services and managing dependencies.

# SETUP

1. Clone the Repository
```
  git clone https://github.com/TheBaby1/Microservice-API_Exercise.git
```
```
  cd Microservice-API_Exercise
```

2. Install Dependencies

**for each service, navigate to its directory and install the dependencies:**
```
  cd product-service
  npm install
```
```
  cd ../customer-service
  npm install
```
```
  cd ../order-service
  npm install
```

3. Run the Services

**for each service, run it on different terminals**
```
cd product-service
npm start
```
```
cd customer-service
npm start
```
```
cd order-service
npm start
```








