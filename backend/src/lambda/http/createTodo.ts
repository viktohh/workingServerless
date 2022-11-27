import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserId } from '../utils'
import { createdTodo } from '../../businessLogic/todos'
//import { todoCreator } from '../../helpers/todos'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const userId = getUserId(event)
    const newTodo: CreateTodoRequest = JSON.parse(event.body)

    // TODO: Implement creating a new TODO item
    const todo = await createdTodo(newTodo,userId)
  
    return {
      statusCode: 201,
      body: JSON.stringify({
        item:todo
      })
    }
  }
)


handler
  .use(
    cors({
      credentials: true
    }))
  
