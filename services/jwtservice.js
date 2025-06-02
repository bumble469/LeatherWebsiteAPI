const jwt = require('jsonwebtoken');
require('dotenv').config();

const createAccessToken = (payload) => {
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET,{
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m',
    });
}

const createRefreshToken = (payload) => {
    return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET,{
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d',
    });
}

const verifyAccessToken = async(token) => {
    return new Promise((resolve,reject) => {
        jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,decoded) => {
            if(err){
                return reject(err);
            }
            resolve(decoded)
        });
    });
};

const verifyRefreshToken = async(token) => {
    return new Promise((resolve,reject) => {
        jwt.verify(token,process.env.REFRESH_TOKEN_SECRET,(err,decoded) => {
            if(err) return reject(err)
            resolve(decoded)
        });
    });
};

module.exports = {
    createAccessToken,
    createRefreshToken,
    verifyAccessToken,
    verifyRefreshToken
}