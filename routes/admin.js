var express = require('express');
var router = express.Router();

const User = require("../models/User")
const auth = require("../middleware/auth")

const isAdmin = (req, res, next) => {
    console.log(req.user.role);
    if (req.user.role === "admin") {
        next()
    } else {
        res.status(403).json({ message: "Access Forbidden" })
    }
}

router.get('/analytics', auth, isAdmin, async (req, res) => {
    try {
        const managers = await User.find({ role: "manager" }, "name email");
        if(managers){
            res.json({managers});
        }
    } catch (error) {
        res.status(500).json({ error: err, msg: "Access denied" })
    }
})

//


module.exports = router;
