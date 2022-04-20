const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = function(req, res, next){
    // getting token from header
    const token = req.header("auth-key");
    if(!token){
        return res.status(400).json({ errors: [{msg: "Unauthorized access"}] });
    }

    //verify key's authenticity
    try{
    const decoded = jwt.verify(token, config.get("secretKey"));
    req.user = decoded;
    next();
    }catch(err){
        res.status(401).json({msg : "You are logged out. Please Login."});
    }

} 

