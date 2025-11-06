import  express,{Router} from "express";

import { loginUser, userRegistration, verifyUserOtp } from "../controllers/auth.controller";

const router : Router = express.Router();

router.post('/user-registration',userRegistration);
router.post('/verify-user',verifyUserOtp);
router.post('/login-user',loginUser);
export default router;