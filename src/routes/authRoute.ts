import { Router } from "express";
import { middlewareController } from "../controllers/MiddlewareController";
import { authController } from "../controllers/AuthController";
// console.log(authController);

const router = Router();

router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);
router.post(
  "/refresh",
  middlewareController.verifyToken,
  authController.requestRefreshToken
);
// router.stack.forEach((middleware) => {
//   if (middleware.route) {
//     console.log(
//       `Route: ${middleware.route.path}, Methods: ${Object.keys(
//         middleware.route
//       ).join(", ")}`
//     );
//   }
// });
export default router;
