import crypto from 'crypto';
import { ValidationError } from '../../../../packages/error-handler';
import { NextFunction } from 'express';
import redis from '../../../../packages/libs/redis';
import { sendEmail } from './sendMail';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;



// in helper function we need to throw errors directly instead of passing to next() . so that controller can catch them properly and handle them uniformly or centered the response sending.

export const validateRegistrationData = (data:any,dataType:"user"|"seller")=>{

    const{email,password,name,mobile_number,country} = data;

    if(!name||!email||!password||(dataType=== "seller" && (!mobile_number||!country))){

        throw new ValidationError('Missing required fields for registration')
    }

    if(!emailRegex.test(email)){
        throw new ValidationError('Invalid email format');

}
}

export const checkOtpRestrictions = async(email:string,next:NextFunction) => {
  
    if(await redis.get(`otp_lock`)){
        throw new ValidationError('OTP requests are temporarily locked. Please try again after 30 minutes.');
    }

    if(await redis.get(`otp_spam_lock:${email}`)){
        throw new ValidationError('Too many OTP requests for this email. Please try again after 1 hour.');

}
if(await redis.get(`otp_cooldown:${email}`)){
    throw new ValidationError('Please wait  1 minutes before requesting another OTP.');
};
}

export const sendOtp = async(email:string,name:string,template:string)=>{
    try {
        if (!email) {
            throw new Error('Email address is required');
        }

        const otp = crypto.randomInt(1000,9999).toString();
        
        const emailSent = await sendEmail(
            email.trim(),
            'Verify your email',
            template,
            { name, otp }
        );

        if (!emailSent) {
            throw new Error('Failed to send email');
        }

        await redis.set(`otp:${email}`, otp, 'EX', 5 * 60); // OTP valid for 5 minutes
        await redis.set(`otp_cooldown:${email}`, 'true', 'EX', 60); // Cooldown of 1 minute

        return true;
    } catch (error) {
        console.error('Error in sendOtp:', error);
        throw error;
    }
}

export const setGlobalOtpLock = async() => {
    // Set global OTP lock for 30 minutes
    await redis.set('otp_lock', 'true', 'EX', 30 * 60);
}

export const removeGlobalOtpLock = async() => {
    // Remove global OTP lock
    await redis.del('otp_lock');
}

export const trackOtpRequests = async(email:string,next:NextFunction) => {
    const otpRequestKey = `otp_requests:${email}`;
    let otpRequest = parseInt(await redis.get(otpRequestKey)||'0');

    if(otpRequest>2){
        await redis.set(`otp_spam_lock:${email}`, 'true', 'EX', 60 * 60); // 1 hour lock
        // If multiple users hit the spam lock, set global lock
        const spamCount = await redis.incr('spam_count');
        if(spamCount > 10) { // If more than 10 users get spam locked
            await setGlobalOtpLock();
        }
       throw new ValidationError('Too many OTP requests for this email. Please try again after 1 hour.');
    }

    await redis.set(otpRequestKey, (otpRequest + 1).toString(), 'EX', 60 * 60); // track otp for  1 hour window
}

export const verifyOtp = async(email:string, otp:string) => {
    const storedOtp = await redis.get(`otp:${email}`);
    if(!storedOtp){
        throw new ValidationError('OTP has expired or is invalid');
    }

    const failedAttemptsKey = `otp_attempts:${email}`;
    const failedAttempts = parseInt(await redis.get(failedAttemptsKey) || '0');

    if(storedOtp !== otp){
        if(failedAttempts >= 3){
            await redis.set(`otp_lock:${email}`, 'true', 'EX', 30 * 60); // set global lock for 30 minutes
            await redis.del(`otp:${email}`, failedAttemptsKey); // delete the counter of failed attempts as well
            throw new ValidationError('Too many incorrect OTP attempts. OTP requests are temporarily locked. Please try again after 30 minutes.');
        }

        await redis.set(failedAttemptsKey, (failedAttempts + 1).toString(), 'EX', 5 * 60); // track failed attempts for 5 minutes
        throw new ValidationError(`Incorrect OTP. You have ${2 - failedAttempts} attempts left.`);
    }

    // OTP is correct
    await redis.del(`otp:${email}`, failedAttemptsKey); // OTP is correct, remove it and reset failed attempts
    return true;
}


// export const handleOtpRequest = async (
//   email: string,
//   name: string,
//   template: string
// ) => {
//   const otpKey = `otp:${email}`;
//   const otpRequestKey = `otp_requests:${email}`;
//   const spamLockKey = `otp_spam_lock:${email}`;
//   const cooldownKey = `otp_cooldown:${email}`;
//   const GLOBAL_SPAM_COUNT = "spam_count";
//   const GLOBAL_LOCK_KEY = "otp_lock";

//   // 1️⃣ Check global locks
//   if (await redis.get(GLOBAL_LOCK_KEY)) {
//     throw new ValidationError(
//       "OTP requests are temporarily locked. Please try again after 30 minutes."
//     );
//   }

//   // 2️⃣ Check individual user locks
//   if (await redis.get(spamLockKey)) {
//     throw new ValidationError(
//       "Too many OTP requests for this email. Please try again after 1 hour."
//     );
//   }

//   if (await redis.get(cooldownKey)) {
//     throw new ValidationError(
//       "Please wait 1 minute before requesting another OTP."
//     );
//   }

//   // 3️⃣ Increment OTP request count
//   const requestCount = await redis.incr(otpRequestKey);

//   // If it's the first increment, set TTL for 1 hour
//   if (requestCount === 1) {
//     await redis.expire(otpRequestKey, 60 * 60);
//   }

//   // 4️⃣ If too many requests → spam lock
//   if (requestCount > 2) {
//     await redis.set(spamLockKey, "true", "EX", 60 * 60); // 1-hour lock
//     const spamCount = await redis.incr(GLOBAL_SPAM_COUNT);

//     // Optional: If spamCount exceeds threshold, set global lock
//     if (spamCount > 10) {
//       await redis.set(GLOBAL_LOCK_KEY, "true", "EX", 30 * 60); // 30 min
//     }

//     throw new ValidationError(
//       "Too many OTP requests for this email. Please try again after 1 hour."
//     );
//   }

//   // 5️⃣ Generate OTP
//   const otp = crypto.randomInt(1000, 9999).toString();

//   try {
//     // Send OTP via email
//     await sendEmail(email, "Verify your email", template, { name, otp });

//     // Store OTP for 5 min, add cooldown for 1 min
//     await redis.set(otpKey, otp, "EX", 5 * 60);
//     await redis.set(cooldownKey, "true", "EX", 60);

//     console.log(`OTP sent successfully to ${email}`);
//   } catch (err) {
//     // If sending email fails → rollback count
//     await redis.decr(otpRequestKey);
//     throw new ValidationError("Failed to send OTP. Please try again.");
//   }

//   return { status: "success", message: "OTP sent successfully" };
// };
