import { AppError } from "./index"
import { Request, Response, NextFunction } from "express";



export const errorMiddleware = (err:Error, req:Request, res:Response, next:NextFunction) => {
if(err instanceof AppError){
    console.log(`Error  ${req.method} ${req.url} - ${err.message}`);

    return res.status(err.statusCode).json({
        status: 'error',
        message: err.message,
        // Include details if available 
        ...(err.details && {details : err.details})
    });
}

console.log("unhandled error : ",err);
return res.status(500).json({
    status: 'error',
    message: 'something went wrong please try again later'
});
}