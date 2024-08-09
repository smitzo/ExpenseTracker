// import { Router } from "express";
// import passport from "passport";
// import TransactionsApi from "./TransactionsApi.js";
// import AuthApi from "./AuthApi.js";
// import UserApi from "./UserApi.js";
// import CategoryApi from "./CategoryApi.js";

// const router = Router();

// const auth = passport.authenticate("jwt", { session: false });

// router.use("/transaction", auth, TransactionsApi);
// router.use("/auth", AuthApi);
// router.use("/user", UserApi);
// router.use("/category", auth, CategoryApi);

// export default router;

import { Router } from "express";
import passport from "passport";
import TransactionsApi from "./TransactionsApi.js";
import AuthApi from "./AuthApi.js";
import UserApi from "./UserApi.js";
import CategoryApi from "./CategoryApi.js";
import authMiddleware from "../middleware/auth.js"; // Import your custom middleware

const router = Router();

// Passport authentication middleware for JWT
const auth = passport.authenticate("jwt", { session: false });

// Use authMiddleware for routes that need user authentication
router.use("/transaction", auth, TransactionsApi);
router.use("/auth", AuthApi);
router.use("/user", authMiddleware, UserApi); // Apply authMiddleware to /user routes
router.use("/category", auth, CategoryApi);

// Add any additional routes here

export default router;
