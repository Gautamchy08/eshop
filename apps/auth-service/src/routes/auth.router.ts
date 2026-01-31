import { isUser } from './../../../../packages/middleware/authorizeRole';
import  express,{Router} from "express";

import { createShop, createStripeConnectLink, getSeller, getUser, loginSeller, loginUser, refreshToken, resetUserPassword, sellerRegistration, userForgotPassword, userRegistration, verifySeller, verifyUserForgotPassword, verifyUserOtp } from "../controllers/auth.controller";
import isAuthenticated from "@packages/middleware/isAuthenticated";
import { isSeller } from "@packages/middleware/authorizeRole";

const router : Router = express.Router();

router.post('/user-registration',userRegistration);
router.post('/verify-user',verifyUserOtp);
router.post('/login-user',loginUser);
router.post('/refresh-token', refreshToken);
router.get('/logged-in-user',isAuthenticated,isUser,getUser);
router.post('/forgot-password-user',userForgotPassword);
router.post('/verify-forgot-password-user',verifyUserForgotPassword);
router.post('/reset-password-user',resetUserPassword);

// Seller Routes can be added similarly
router.post('/seller-registration',sellerRegistration);
router.post('/verify-seller',verifySeller);
router.post('/login-seller',loginSeller);
router.get('/logged-in-seller',isAuthenticated,isSeller,getSeller)
router.post('/create-shop',createShop);
router.get('/create-stripe-link',createStripeConnectLink)

export default router;