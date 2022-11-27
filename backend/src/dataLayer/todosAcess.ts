import * as AWS from 'aws-sdk'
const AWSXRay = require('aws-xray-sdk')
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoUpdate } from '../models/TodoUpdate';
import { TodoItem } from "../models/TodoItem"


const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')
const todosTable = process.env.TODOS_TABLE
const index = process.env.TODOS_CREATED_AT_INDEX
const docClient: DocumentClient = createDynamoDBClient()

// // TODO: Implement the dataLayer logic

export async function createTodo(todo : TodoItem) : Promise<TodoItem> {
  logger.info('create todo', todo)
  await docClient
      .put({
          TableName: todosTable,
          Item: todo
      })
      .promise()
      logger.info('Todo item created')

  return todo
}

export async function getAllTodosByUser(userId: string ): Promise<TodoItem[]> {
  logger.info('Get all todos by user')
  const result = await docClient.query({
    TableName: todosTable,
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
        ':userId': userId
    },
  }).promise()
  const items = result.Items

  return items as TodoItem[]
}

export async function getTodoById(todoId: string ): Promise<TodoItem> {
  logger.info('Get all todos by Id')
  const result = await docClient.query({
    TableName: todosTable,
    IndexName: index,
    KeyConditionExpression: 'todoId = :todoId',
    ExpressionAttributeValues: {
        ':todoId': todoId
    },
    ScanIndexForward: false
  }).promise()
  const items = result.Items
  if (items.length !== 0)
    return result.Items[0] as TodoItem

  return null
}

export async function updateItems(todo: TodoItem ): Promise<TodoItem> {
  const result = await docClient.update({
    TableName: todosTable,
    Key: {
      userId: todo.userId, 
      todoId: todo.todoId
    },
    UpdateExpression: 'set attachmentUrl = :attachmentUrl',
    ExpressionAttributeValues: {
        ':attachmentUrl': todo.attachmentUrl
    }
  }).promise()
  logger.info('Todo item updated', result)
  return result.Attributes as TodoItem
}

export async function updateTodo(userId: string, todoId: string, todo: TodoUpdate): Promise<TodoUpdate> {
  const result = await docClient.update({
     TableName: todosTable,
     Key: { userId, todoId },
     UpdateExpression: "set #name = :name, dueDate=:dueDate, done=:done",
     ExpressionAttributeValues: {
       ":n": todo.name,
       ":dueDate": todo.dueDate,
       ":done": todo.done
     },
     ExpressionAttributeNames: { '#name': 'name' },
   }).promise()
   return result.Attributes as TodoUpdate
 }

export async function deleteTodoItem(todoId: string, userId: string): Promise<string> {
    const result = await docClient.delete({
    TableName: todosTable,
    Key: {
      todoId,
      userId
    }
  }).promise()
  logger.info('Todo item deleted', result)
  return todoId as string
}

  function createDynamoDBClient() {
    if (process.env.IS_OFFLINE) {
      console.log('Creating a local DynamoDB instance')
      return new XAWS.DynamoDB.DocumentClient({
        region: 'localhost',
        endpoint: 'http://localhost:8000'
      })
    }
  
    return new XAWS.DynamoDB.DocumentClient()
  }