const Admin = require('../models/admin')
const bcrypt = require('bcrypt')

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
        return res.status(200).json({message:'Login Success!', adminUsername})
    }
    catch(error){
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

const getAdminDetails = async (req, res) => {
    try {
        const adminId = req.params.id;
        const admin = await Admin.findById(adminId).select('password');
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        return res.status(200).json(admin);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = {loginAdmin, getAdminDetails}