import express from "express";
// import itemRoutes from './routes/itemRoutes';
import { errorHandler } from "./middlewares/errorHandler";
import userRoutes from "./routes/userRoute";
import authRoutes from "./routes/authRoute";
const app = express();

app.use(express.json());

// Routes
// app.use('/api/items', itemRoutes);
app.use("/api/users", userRoutes);

app.use("/api/auth", authRoutes);
// Global error handler (should be after routes)
app.use(errorHandler);

export default app;
