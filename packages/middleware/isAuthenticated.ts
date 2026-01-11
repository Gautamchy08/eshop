import  jwt  from 'jsonwebtoken';
import { NextFunction } from "express";
import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();


const isAuthenticated = async (req:any,res:any,next:NextFunction)=>{

    try {
        const token = req.cookies['access_token'] || req.cookies['seller-access-token'] || req.headers.authorization?.split(" ")[1];

    if(!token){
        console.log('no token found at isAuthenticated')
        return res.status(401).json({
            status : 'error',
            message : 'Unauthorized! No token provided'
        });
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET as string) as {id:string, role:'user'|'seller'};
    console.log('decoded data from isAuthenticated',decoded)

    if(!decoded){
        console.log('invalid token at is authenticated')
        return res.status(403).json({
            status : 'error',
            message : 'Forbidden! invalid token'
        });
    }

    let account;
    

    if(decoded.role === 'user'){
         account = await prisma.users.findUnique({
            where : {id : decoded.id}
        });
        req.user = account;

    } else {
         account = await prisma.sellers.findUnique({
            where : {id : decoded.id},
            include:{shop:true}
        });
        req.seller = account;
    }

    if(!account){
        return res.status(404).json({
            status : 'error',
            message : 'Account not found'
        });
    }
    req.role = decoded.role;
    return next();
    } catch (error) {
        console.log(error)
         return res.status(401).json({
            status : 'error',
            message : 'Invalid token'
        });
    }
}
export default isAuthenticated;