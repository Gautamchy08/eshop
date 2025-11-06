
import { checkOtpRestrictions, sendOtp, trackOtpRequests, validateRegistrationData, verifyOtp } from '../utils/auth.helper';
import { Request,Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { NotFoundError, ValidationError } from '@packages/error-handler';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { setCookie } from '../utils/cookie/setCookie';

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
        await verifyOtp(email, otp);

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

