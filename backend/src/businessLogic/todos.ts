//import { APIGatewayProxyEvent } from 'aws-lambda'
//import { TodosAccess } from './todosAcess'
// import { AttachmentUtils } from '../helpers/attachmentUtils';
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import * as uuid from 'uuid'
import { deleteTodoItem } from '../dataLayer/todosAcess'
import { TodoItem } from '../models/TodoItem'
import { createTodo } from '../dataLayer/todosAcess'
import { createLogger } from '../utils/logger'
import { getTodoById } from '../dataLayer/todosAcess'
import { TodoUpdate } from '../models/TodoUpdate'
// import * as createError from 'http-errors'

const logger = createLogger('TodosAccess')

export async function createdTodo(todoRequest: CreateTodoRequest, userId: string): Promise<TodoItem>{
  logger.info('createdTodo function created')
  const todoId = uuid.v4()
    const todo = {
        todoId: todoId,
        createdAt: new Date().toISOString(),
        userId,
        ...todoRequest,
      }
    
      return await createTodo(todo as TodoItem)
}

export async function updatedTodos(todoId: string, todo: UpdateTodoRequest): Promise<TodoUpdate> {

  logger.info('todo was updated', todoId)
  await getTodoById(todoId)

  return todo as TodoUpdate
}

export async function deleteTodo(
  userId: string,
  todoId: string
): Promise<string> {
  return deleteTodoItem(todoId, userId)
}