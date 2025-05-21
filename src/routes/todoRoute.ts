import { Router } from "express";
import { todoController } from "../controllers/TodoController";
const router = Router();

router.get("/", todoController.getAllTodos);

router.get(
  "/:id",
  //   middlewareController.verifyToken,
  todoController.getTodoById
);

router.post("/", todoController.createTodo);

router.patch("/:id/status", todoController.updateTodoStatus);

router.patch(
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
