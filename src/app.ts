import express, { Request, Response } from "express";
// import itemRoutes from './routes/itemRoutes';
import { errorHandler } from "./middlewares/errorHandler";
import userRoutes from "./routes/userRoute";
import eventRoutes from "./routes/eventRoute";
import authRoutes from "./routes/authRoute";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import path from "path";
const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());
app.use("/api/users", userRoutes);

app.use("/api/auth", authRoutes);
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
  apis: [
    path.join(__dirname, "./routes/*.ts"),
    path.join(__dirname, "./app.ts"),
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// Routes
// app.use('/api/items', itemRoutes);
app.use("/api/users", userRoutes);
app.use("/api/events", eventRoutes);

app.use("/api/auth", authRoutes);
// Global error handler (should be after routes)
/**
 * @openapi
 * /:
 *   get:
 *     summary: "Get Hello World"
 *     description: "Returns a simple 'Hello World!' message."
 *     responses:
 *       200:
 *         description: "A Hello World message."
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Hello World!"
 */
app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});
app.use(errorHandler);

export default app;
