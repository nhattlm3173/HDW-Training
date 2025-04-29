import { Router } from "express";
import { middlewareController } from "../controllers/MiddlewareController";
import { authController } from "../controllers/AuthController";
/**
 * @openapi
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
// console.log(authController);
/**
 * @openapi
 * components:
 *   schemas:
 *     AuthRegisterRequest:
 *       type: object
 *       required:
 *         - email
 *         - phoneNumber
 *         - username
 *         - password
 *         - confirmPassword
 *       properties:
 *         email:
 *           type: string
 *           example: nhocnhat020@gmail.com
 *         phoneNumber:
 *           type: string
 *           example: 0786571369
 *         username:
 *           type: string
 *           example: nhat123
 *         password:
 *           type: string
 *           example: 123456
 *         confirmPassword:
 *           type: string
 *           example: 123456
 */
/**
 * @openapi
 * components:
 *   schemas:
 *     AuthLoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           example: nhocnhat020@gmail.com
 *         password:
 *           type: string
 *           example: 123456
 */
const router = Router();
/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuthRegisterRequest'
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 */

router.post("/register", authController.registerUser);
/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuthLoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TokenResponse'
 *       401:
 *         description: Invalid credentials
 */

router.post("/login", authController.loginUser);
/**
 * @openapi
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: cookie
 *         name: refreshToken
 *         schema:
 *           type: string
 *         required: true
 *         description: Refresh token cookie
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 */
router.post(
  "/refresh",
  middlewareController.verifyToken,
  authController.requestRefreshToken
);
export default router;
