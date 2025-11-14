const jwt= require("jsonwebtoken");
const User= require("../models/UserModel");

// what does prottect do?
// protect middleware checks if the user is authenticated

const protect= async (req,res,next)=>{
    // Get token from header
    let token;
    if (
        req.headers.authorization && 
        req.headers.authorization.startsWith("Bearer")
    ) {
        try{
            token=req.headers.authorization.split(" ")[1];
            
            const decoded= jwt.verify(token, process.env.JWT_SECRET)
            
            req.user=await User.findById(decoded.id).select("-password")
            console.log(req.user)
            next()
        }
        catch(error){
            res.status(401).json({message:'Not authorized, token failed'})
        }
    }
    if(!token){
        res.status(401).json({message:'Not authorized, token not found'})
    }
}

const isAdmin=(req,res,next)=>{
    try{
        if(req.user && req.user.isAdmin){
            next()
        }
        else{
            res.status(403).json({message:'Not authorized as an admin'})
        }
    }
    catch(error){
        res.status(401).json({message:'Not authorized, token failed'})
    }

}

module.exports= {protect, isAdmin}