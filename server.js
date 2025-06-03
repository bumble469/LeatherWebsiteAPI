const express = require('express');
const cors = require('cors');
const {connectDB} = require('./config/db');
const productRoute = require('./routes/productRoute');
const productSizeRoute = require('./routes/productAttributesRoute');
const adminAccessRoute = require('./routes/adminAccessRoute');
const adminOtpRoute = require('./routes/adminOtpRoute');
const productAdminRoute = require('./routes/productAdminRoutes');
const orderRoute = require('./routes/ordersRoute');
const orderAdminRoute = require('./routes/orderAdminRoute');

const cookieParser = require('cookie-parser');

const app = express();
app.use(express.json());
app.use(cookieParser());

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : [];  

app.use(cors({
  origin: function(origin, callback){
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials:true
}));

const port = process.env.PORT || 5000;
connectDB();

app.use('/api', productRoute);
app.use('/api', productSizeRoute);
app.use('/api', adminAccessRoute);
app.use('/api', adminOtpRoute);
app.use('/api', productAdminRoute);
app.use('/api', orderRoute);
app.use('/api', orderAdminRoute);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});