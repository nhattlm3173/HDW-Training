// import express, { Request, Response } from "express";
// import swaggerUi from "swagger-ui-express";
// import swaggerJsdoc from "swagger-jsdoc";
// import mongoose from "mongoose";
// import cors from "cors";
// import "dotenv/config";
// import bodyParser from "body-parser";
// import cookieParser from "cookie-parser";
// import userRoutes from "./routes/userRoute";
// import authRoutes from "./routes/authRoute";
// // console.log(authRoutes);
// // authRoutes.stack.forEach((middleware: any) => {
// //   if (middleware.route) {
// //     console.log(
// //       `Route: ${middleware.route.path}, Methods: ${Object.keys(
// //         middleware.route.methods
// //       ).join(", ")}`
// //     );
// //   } else if (middleware.name === "router") {
// //     // Nếu là một router middleware, kiểm tra các stack của nó
// //     middleware.handle.stack.forEach((subMiddleware: any) => {
// //       if (subMiddleware.route) {
// //         console.log(
// //           `Route: ${subMiddleware.route.path}, Methods: ${Object.keys(
// //             subMiddleware.route.methods
// //           ).join(", ")}`
// //         );
// //       }
// //     });
// //   }
// // });
// const app = express();
// app.use(
//   cors({
//     origin: "*",
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     credentials: true,
//   })
// );
// app.use(bodyParser.json({ limit: "50mb" }));
// app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
// app.use(express.json());
// app.use(cookieParser());
// app.use("/api/users", userRoutes);

// app.use("/api/auth", authRoutes);
// const swaggerOptions = {
//   definition: {
//     openapi: "3.0.0",
//     info: {
//       title: "My API",
//       version: "1.0.0",
//       description: "API documentation with Swagger",
//     },
//     servers: [
//       {
//         url: "http://localhost:3000",
//       },
//     ],
//   },
//   apis: ["../src/routes/**/*.ts", "../src/app.ts"],
// };

// const swaggerSpec = swaggerJsdoc(swaggerOptions);
// app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// const connectionURI: string = process.env.DB_URI || "";

// if (!connectionURI) {
//   console.error("DB_URI is not defined in environment variables.");
//   process.exit(1);
// }

// mongoose
//   .connect(connectionURI)
//   .then(() => console.log("✅ Successfully connected to the database"))
//   .catch((err: unknown) => {
//     console.error("❌ Could not connect to the database. Exiting now...", err);
//     process.exit(1);
//   });

// /**
//  * @openapi
//  * /:
//  *   get:
//  *     summary: "Get Hello World"
//  *     description: "Returns a simple 'Hello World!' message."
//  *     responses:
//  *       200:
//  *         description: "A Hello World message."
//  *         content:
//  *           text/plain:
//  *             schema:
//  *               type: string
//  *               example: "Hello World!"
//  */
// app.get("/", (req: Request, res: Response) => {
//   res.send("Hello World!");
// });

// const PORT = 3000;

// app.listen(PORT, () => {
//   // app.router.stack.forEach((middleware: any) => {
//   //   if (middleware.route) {
//   //     console.log(
//   //       `Route: ${middleware.route.path}, Methods: ${Object.keys(
//   //         middleware.route.methods
//   //       ).join(", ")}`,
//   //       middleware
//   //     );
//   //   } else if (middleware.name === "router") {
//   //     middleware.handle.stack.forEach((subMiddleware: any) => {
//   //       if (subMiddleware.route) {
//   //         console.log(
//   //           `Route: ${subMiddleware.route.path}, Methods: ${Object.keys(
//   //             subMiddleware.route.methods
//   //           ).join(", ")}`,
//   //           middleware
//   //         );
//   //       }
//   //     });
//   //   }
//   // });
//   console.log(`Server is running on http://localhost:${PORT}`);
//   console.log(`Swagger is available at http://localhost:${PORT}/api-docs`);
// });
import app from "./app";
import config from "./config/config";
import mongoose from "mongoose";
const connectionURI: string = process.env.DB_URI || "";

if (!connectionURI) {
  console.error("DB_URI is not defined in environment variables.");
  process.exit(1);
}
mongoose
  .connect(connectionURI)
  .then(() => console.log("✅ Successfully connected to the database"))
  .catch((err: unknown) => {
    console.error("❌ Could not connect to the database. Exiting now...", err);
    process.exit(1);
  });
app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
