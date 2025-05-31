const express = require('express');
const cors = require('cors');
const {connectDB} = require('./config/db');
const productRoute = require('./routes/productRoute');
const productSizeRoute = require('./routes/productAttributesRoute');
const adminRoute = require('./routes/adminRoute');
const adminAccessRoute = require('./routes/adminAccessRoute');
const adminOtpRoute = require('./routes/adminOtpRoute');
const productAdminRoute = require('./routes/productAdminRoutes');
const app = express();
app.use(express.json());
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
  }
}));

const port = process.env.PORT || 5000;
connectDB();
app.use('/api', productRoute);
app.use('/api', productSizeRoute);
app.use('/api', adminRoute);
app.use('/api',adminAccessRoute);
app.use('/api',adminOtpRoute);
app.use('/api',productAdminRoute);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});