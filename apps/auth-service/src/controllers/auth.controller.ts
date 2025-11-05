
import { checkOtpRestrictions, sendOtp, trackOtpRequests, validateRegistrationData } from '../utils/auth.helper';
import { Request,Response, NextFunction } from 'express';
import prisma from '@packages/libs/prisma';
import { ValidationError } from '@packages/error-handler';
// registering user and 


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
await sendOtp(email,name,'user-activation-mail');

return res.status(200).json({
    status : 'success',
    message : 'OTP sent to your email for verification'
});
} catch (error) {
    return next(error);
}



};