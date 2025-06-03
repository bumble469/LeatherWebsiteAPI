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
  const {refreshToken} = req.cookies;
  try{
    const decoded = await verifyRefreshToken(refreshToken);
    const accessToken = createAccessToken({email:decoded.email});
    res.cookie('accessToken',accessToken,{
        httpOnly: true,
        maxAge: 15 * 60 * 1000,
        secure: false,     
        sameSite: 'lax',
    });
    res.status(200).json({accessToken})
  }catch(err){
    res.status(401).json({message:'Invalid refresh token!'})
  }
}

const logoutAdmin = async (req, res) => {
  try {
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: false,    
      sameSite: 'lax',
      path: '/',        
    });
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
    });
    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};


module.exports = { checkAdminAccess, refreshAccessToken, loginAdmin, logoutAdmin };
