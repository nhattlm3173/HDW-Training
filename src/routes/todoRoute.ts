import { Router } from "express";
import { todoController } from "../controllers/TodoController";
import multer from "multer";
const upload = multer();

const router = Router();

router.get("/", todoController.getAllTodos);

router.get("/total", todoController.getTotalAndTotalFinishTodos);

router.get(
  "/:id",
  //   middlewareController.verifyToken,
  todoController.getTodoById
);

router.post("/", upload.none(), todoController.createTodo);

router.patch("/:id/status", todoController.updateTodoStatus);

router.put(
  "/:id",
  //   middlewareController.verifyToken,
  todoController.updateTodo
);

router.delete(
  "/:id",
  //   middlewareController.verifyToken,
  todoController.deleteTodo
);
export default router;
