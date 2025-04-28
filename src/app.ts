import express, { Request, Response } from "express";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import mongoose from "mongoose";
import cors from "cors";
import "dotenv/config";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/UserRoute/index";
const app = express();
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(express.json());
app.use(cookieParser());

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "My API",
      version: "1.0.0",
      description: "API documentation with Swagger",
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
  },
  apis: ["../src/routes/**/*.ts", "../src/app.ts"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
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

app.use("/api/users", userRoutes);
app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Swagger is available at http://localhost:${PORT}/api-docs`);
});
