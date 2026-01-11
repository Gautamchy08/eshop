
import { checkOtpRestrictions, handleForgotPassword, sendOtp, trackOtpRequests, validateRegistrationData, verifyForgotPasswordOtp, verifyOtp } from '../utils/auth.helper';
import { Request,Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { NotFoundError, ValidationError } from '@packages/error-handler';
import bcrypt from 'bcryptjs';
import jwt, { JsonWebTokenError } from 'jsonwebtoken';
import dotenv from 'dotenv';
import { setCookie } from '../utils/cookie/setCookie';
import stripeClient from '../utils/stripes/stripe';

dotenv.config();

const prisma = new PrismaClient();

// registering user and sending otp to email

export const userRegistration = async(req:Request, res:Response,next:NextFunction) => {

try {
    validateRegistrationData(req.body,"user");

const {name,email} = req.body;


const existingUser = await prisma.users.findUnique({
    where : {email}
})

if(existingUser){
 return next(new ValidationError('User with this email already exists'));
}


await checkOtpRestrictions(email, next);
await trackOtpRequests(email,next);
await sendOtp(email, name, 'user-activation-mail');

return res.status(200).json({
    status : 'success',
    message : 'OTP sent to your email for verification'
});
} catch (error) {
    return next(error);
}



};

// verify users with otp

export const verifyUserOtp = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {email, otp, name, password} = req.body;

        if(!email || !otp || !name || !password){
            throw new ValidationError('Missing required fields for OTP verification');
        }

        const existingUser = await prisma.users.findUnique({
            where: {email}
        });
        
        if(existingUser){
            throw new ValidationError('User with this email already exists');
        }

        // This will throw an error if OTP verification fails
        await verifyOtp(email, otp,next);

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.users.create({
            data: {
                name,
                email,
                password: hashedPassword
            }
        });

        return res.status(201).json({
            status: 'success',
            message: 'User registered successfully',
            data: {
                userId: newUser.id,
                email: newUser.email,
                name: newUser.name
            }
        });
        
    } catch (error) {
        return next(error);
    }
};

// login user with email and password

export const loginUser = async (req:Request, res:Response, next:NextFunction) => {

    try {
        const {email , password} = req.body;


        // validate input
        if(!email || !password){
            throw new ValidationError('Email and password are required for login');
        }
           // see if user exists
        const user =  await prisma.users.findUnique({
            where : {email}
        });
        // user not found
        if(!user){
              throw new NotFoundError('No user found with this email');
        }
        //  verify password
        const isPasswordValid = await bcrypt.compare(password, user.password!);
          // invalid password
        if(!isPasswordValid){
            throw new ValidationError('Invalid password');
        }

        // clear existing cookies
        res.clearCookie('seller-access-token');
        res.clearCookie('seller-refresh-token');

        // generate JWT token => jwt.sign(payload, secretOrPrivateKey,expiresIn, [options, callback])
          
        const accessToken = jwt.sign(

            { userId: user.id, role : "user" },

            process.env.JWT_ACCESS_TOKEN_SECRET as string,

            { expiresIn: '15min' }
        );

        // generate refresh token

        const refreshToken = jwt.sign(
            { userId: user.id, role : "user" },

            process.env.JWT_REFRESH_TOKEN_SECRET as string,

            { expiresIn: '7d' }
        );

        // debugging

        console.log('this is your acess token',accessToken);
        console.log('this is refresh token',refreshToken);

        // setting cookies

        setCookie(res, 'access_Token', accessToken);
        setCookie(res, 'refresh_Token', refreshToken);

        return res.status(200).json({
            status: 'success',
            message: 'User logged in successfully',
            data: {
                id: user.id,
                email: user.email,
                name : user.name,
            }
        });
    } catch (error) {
        return next(error);
    }
}

// refresh access token controller

export const refreshToken = async(req:any, res:Response,next:NextFunction) => {
    try {
const refreshToken = req.cookies['refresh_token'] || req.cookies['seller-refresh-token'] || req.headers.authorization?.split(" ")[1];
      if(!refreshToken){
        return new ValidationError('Unauthorized! no Refresh token found');
      }

      const decoded =jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_TOKEN_SECRET as string
      )as {id:string,role:string};
      
      if(!decoded|| !decoded.role || !decoded.id ){
        return  new JsonWebTokenError('Forbidden! invalid refresh token');
      }    

      let account ;
      if(decoded.role === 'user'){
          account = await prisma.users.findUnique({
              where : {id : decoded.id}
          });
      }
      else if(decoded.role === 'seller'){
        account = await prisma.sellers.findUnique({
            where : {id : decoded.id},
            include : {shop : true}
        });
      }



            if(!account){
                return new NotFoundError('Forbidden! user/seller not found');
            }

            const newAccessToken = jwt.sign(
                { id: decoded.id, role : decoded.role },
                process.env.JWT_ACCESS_TOKEN_SECRET as string,
                { expiresIn: '15min' }
            );

            if(decoded.role === 'user'){
                setCookie(res,'access_token', newAccessToken);
            }
            else if(decoded.role === 'seller'){
                setCookie(res,'seller-access-token', newAccessToken);
            }
             
            req.role = decoded.role;

            return res.status(200).json({
                success : true,
                message : 'Access token refreshed successfully'
            });
        

    } catch (error) {
       return next(error); 
    }
};

// get user Logged in Info

export const getUser = async(req:any, res:any,next:NextFunction) => {
    try {
       const user = req.user;
         return res.status(200).json({
            success : true,
            user });
    } catch (error) {
        
    }
}

// forgot password controller

export const userForgotPassword = async(req:Request, res:Response,next:NextFunction) => {

  try {
    await handleForgotPassword(req, res,next,'user');
    return res.status(200).json({
        status : 'success',
        message : 'OTP sent to your email for password reset'
    });
  } catch (error) {
     return next(error);
  }
};

// verify otp for password reset

export const verifyUserForgotPassword = async (req:Request, res:Response,next:NextFunction) => {

    try {
        await verifyForgotPasswordOtp(req, res,next);
        return res.status(200).json({
            status : 'success',
            message : 'OTP verified successfully. Reset your password now.'
        });
    } catch (error) {
        return next(error);
    }
}

//reset password controller

export const resetUserPassword = async(req:Request, res:Response,next:NextFunction) => {

    try {
         const {email,newPassword} = req.body;
        if(!email || !newPassword){
            throw new ValidationError('Email and new password are required for password reset');
        }
         
        const user = await prisma.users.findUnique({
            where : {email}
        });
        if(!user){
            throw new NotFoundError('No user found with this email');
        }
       const isPasswordSame = await bcrypt.compare(newPassword, user.password!);
         if(isPasswordSame){
            throw new ValidationError('New password must be different from the old password');
         };

         // hash the new password

         const hashedPassword = await bcrypt.hash(newPassword,10);
         await prisma.users.update({
            where : {email},
            data : {password : hashedPassword}
         });

         return res.status(200).json({
            status : 'success',
            message : 'Password reset successfully' 
         })
    } catch (error) {
        return next(error);
    }
}

// ------------------ SELLER AUTH CONTROLLERS ------------------ //

// registering seller and sending otp to email

export const sellerRegistration = async(req:Request, res:Response,next:NextFunction) => {

    try {
       validateRegistrationData(req.body,"seller");

    const {name,email} = req.body;

    const existingSeller = await prisma.sellers.findUnique({
        where : {email}
    });
    if(existingSeller){
     return next(new ValidationError('Seller with this email already exists'));
    };

    await checkOtpRestrictions(email, next);
    await trackOtpRequests(email,next);
    await sendOtp(email, name, 'seller-activation');

    res.status(200).json({
        status : 'success',
        message : 'OTP sent to your email for verification'
    });
     
    } catch (error) {
        next(error);
    }
}


// verify seller with otp

export const verifySeller = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {email,otp,name,password,phone_number,country} = req.body;
        if(!email || !otp || !name || !password || !phone_number || !country){
            throw new ValidationError('Missing required fields for OTP verification');
        };
        
        const existingSeller = await prisma.sellers.findUnique({
            where: {email}
        });

        if(existingSeller){
            throw new ValidationError('Seller with this email already exists');
        };
        await verifyOtp(email, otp,next);

        const hashedPassword = await bcrypt.hash(password, 10);

        const newSeller = await prisma.sellers.create({
            data: {
                name,
                email,
                password: hashedPassword,
                country,
                phone_number
            }
        });

        res.status(201).json({
            status: 'success',
            message: 'Seller registered successfully',
            newSeller
        });
    } catch (error) {
        next(error);
    }
}

//  login seller with email and password

export const loginSeller = async (req:Request, res:Response, next:NextFunction) => {
    try {
        const {email , password} = req.body;

        if(!email || !password){
            throw new ValidationError('Email and password are required for login');
        }
        const seller =  await prisma.sellers.findUnique({
            where : {email}
        });
        if(!seller){

                throw new NotFoundError('No seller found with this email');
        }
        const isPasswordValid = await bcrypt.compare(password, seller.password!);
        if(!isPasswordValid){
            throw new ValidationError('Invalid password');
        }

        res.clearCookie('access_token');
        res.clearCookie('refresh_token'); 

        const accessToken = jwt.sign(
            { id: seller.id, role : "seller" },
            process.env.JWT_ACCESS_TOKEN_SECRET as string,
            { expiresIn: '15min' }
        );

        const refreshToken = jwt.sign(
            { id: seller.id, role : "seller" },
            process.env.JWT_REFRESH_TOKEN_SECRET as string,
            { expiresIn: '7d' }
        );
        //  setting cookies
        setCookie(res, 'seller-access-token', accessToken);
        setCookie(res, 'seller-refresh-token', refreshToken);

        res.status(200).json({
            status: 'success',
            message: 'Seller logged in successfully',
            data: {
                id: seller.id,
                email: seller.email,
                name : seller.name,
            }
        });

    } catch (error) {
        return next(error);
    }
}

//  get seller Logged in Info
export const getSeller = async(req:any, res:any,next:NextFunction) => {
    try {
       const seller = req.seller;
            return res.status(200).json({
            success : true,
            seller });
    } catch (error) {
        return next(error);
    }
}

// creating a new shop for seller

export const createShop = async(req:Request, res:Response,next:NextFunction) => {

    try {
       const {name,bio,address,opening_hours,website,category,sellerId}= req.body;

       console.log(name,bio,address,opening_hours,website,category,sellerId)
       
       if(!name|| !bio || !address || !opening_hours  || !category || !sellerId){
        throw new ValidationError('All fields are required to create a shop');
       }
       
       const shopData:any = {
            name,
            bio,
            category,
            address,
            opening_hours,
            sellerId
       }

       if(website && website.trim() !== ''){
        shopData.website = website;
       };

       const existingShop = await prisma.shops.findFirst({
        where : {
            name,
            sellerId
        } 
       });
         if(existingShop){
            throw new ValidationError('You already have a shop with this name');
         };

       const newShop = await prisma.shops.create({
        data : shopData
       });
         res.status(201).json({
            status : 'success',
            message : 'Shop created successfully',
            newShop
         });

    } catch (error) {
        next(error);
    }
}


// create stripe account for seller

export const createStripeConnectLink = async(req:Request, res:Response,next:NextFunction) => {
    try {
          const { sellerId } = req.query;
          const sellerIdStr = String(sellerId);
          console.log('selleridstr recieved from query',sellerIdStr)
        if(!sellerIdStr){
            throw new ValidationError('Seller ID is required to create Stripe account');
         };
         
        const seller = await prisma.sellers.findUnique({
            where : {id : sellerIdStr}
        });

        if(!seller){
            throw new NotFoundError('Seller not found');
        }
//    create stripe account
        const account =  await stripeClient.accounts.create({
            type: 'express',
            country: 'IN',
            email: seller?.email,
            business_type: 'individual',
            capabilities: {
                card_payments: {requested: true},
                transfers: {requested: true},
            }
        })

        // save stripe account id in seller schema

        await prisma.sellers.update({
            where : {id : sellerIdStr},
            data : {
                stripeId : account.id
            }
        });
    // create account link
        const accountLink = await stripeClient.accountLinks.create({
            account: account.id,
            refresh_url: `http://localhost:3000/success`,
            return_url: `http://localhost:3000/success`,
            type: 'account_onboarding',
        });

        res.json({
            success : true,
            url : accountLink.url
        })
    } catch (error) {
        return next(error);
    } 
}



