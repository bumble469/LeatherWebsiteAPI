const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY;

const checkAdminAccess = (req, res) => {
  const { secretKey } = req.body; 

  if (secretKey === ADMIN_SECRET_KEY) {
    return res.status(200).json({ message: 'Access Granted!' });
  } else {
    return res.status(403).json({ message: 'Access Denied!' });
  }
};

module.exports = { checkAdminAccess };
