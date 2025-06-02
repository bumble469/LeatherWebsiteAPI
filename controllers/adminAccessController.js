const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY;
const {createAccessToken,verifyRefreshToken} = require('../services/jwtservice');
const Admin = require('../models/admin')
const bcrypt = require('bcrypt')

const checkAdminAccess = (req, res) => {
  const { secretKey } = req.body; 

  if (secretKey === ADMIN_SECRET_KEY) {
    return res.status(200).json({ message: 'Access Granted!' });
  } else {
    return res.status(403).json({ message: 'Access Denied!' });
  }
};

const loginAdmin = async(req, res) => {
    try{
        const {email, password} = req.body
        const admin = await Admin.findOne({email});
        if(!admin){
            return res.status(400).json({message:"Admin not found"})
        }
        const isMatch = await bcrypt.compare(password, admin.password);
        if(!isMatch){
            return res.status(400).json({message:"Invalid Password!"});
        }
        adminUsername = admin.username
        return res.status(200).json({message:'Credentials Match!', adminUsername})
    }
    catch(error){
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

const refreshAccessToken = async(req,res) => {
  const {refreshToken} = req.body;
  try{
    const decoded = await verifyRefreshToken(refreshToken);
    const accessToken = createAccessToken({email:decoded.email});
    res.status(200).json({accessToken})
  }catch(err){
    res.status(401).json({message:'Invalid refresh token!'})
  }
}

module.exports = { checkAdminAccess, refreshAccessToken, loginAdmin };
