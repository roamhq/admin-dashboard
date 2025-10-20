import { ECSClient, RunTaskCommand, ListTaskDefinitionsCommand } from '@aws-sdk/client-ecs'
import { groupTasksByClient } from './ecs-tasks-generator.js'

export async function onRequest({ request, env }) {
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  }

  if (request.method === 'POST') {
    try {
      const body = await request.json()
      const { tasks, cluster, region, subnets, securityGroups, assignPublicIp } = body

      // Support both single task and batch tasks
      const taskDefinitions = tasks || (body.taskDefinition ? [body.taskDefinition] : [])

      // Validate required fields
      if (!cluster || !region || taskDefinitions.length === 0) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Missing required fields: cluster, region, or tasks',
          }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Credentials': 'true',
              'Access-Control-Allow-Origin': '*',
            },
          },
        )
      }

      // Get AWS credentials from environment variables
      const awsAccessKeyId = env.AWS_ACCESS_KEY_ID
      const awsSecretAccessKey = env.AWS_SECRET_ACCESS_KEY

      if (!awsAccessKeyId || !awsSecretAccessKey) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'AWS credentials not configured',
          }),
          {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Credentials': 'true',
              'Access-Control-Allow-Origin': '*',
            },
          },
        )
      }

      // Configure ECS client
      const ecsClient = new ECSClient({
        region: region,
        credentials: {
          accessKeyId: awsAccessKeyId,
          secretAccessKey: awsSecretAccessKey,
        },
      })

      // Run tasks in parallel
      const results = await Promise.allSettled(
        taskDefinitions.map(async (taskDefinition) => {
          const params = {
            cluster: cluster,
            taskDefinition: taskDefinition,
            launchType: 'FARGATE',
            networkConfiguration: {
              awsvpcConfiguration: {
                subnets: subnets || [],
                securityGroups: securityGroups || [],
                assignPublicIp: assignPublicIp ? 'ENABLED' : 'DISABLED',
              },
            },
          }

          const command = new RunTaskCommand(params)
          const response = await ecsClient.send(command)

          if (response.tasks && response.tasks.length > 0) {
            return {
              success: true,
              taskDefinition,
              taskArn: response.tasks[0].taskArn,
            }
          } else if (response.failures && response.failures.length > 0) {
            throw new Error(response.failures[0].reason || 'Failed to start task')
          } else {
            throw new Error('Unknown error occurred')
          }
        }),
      )

      // Process results
      const successfulTasks = []
      const failedTasks = []

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          successfulTasks.push(result.value)
        } else {
          failedTasks.push({
            taskDefinition: taskDefinitions[index],
            error: result.reason.message,
          })
        }
      })

      const allSucceeded = failedTasks.length === 0
      const partialSuccess = successfulTasks.length > 0 && failedTasks.length > 0

      return new Response(
        JSON.stringify({
          success: allSucceeded,
          partial: partialSuccess,
          results: {
            successful: successfulTasks,
            failed: failedTasks,
          },
          message: allSucceeded
            ? `All ${successfulTasks.length} task(s) started successfully`
            : partialSuccess
              ? `${successfulTasks.length} of ${taskDefinitions.length} task(s) started successfully`
              : 'All tasks failed to start',
        }),
        {
          status: allSucceeded ? 200 : partialSuccess ? 207 : 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Credentials': 'true',
            'Access-Control-Allow-Origin': '*',
          },
        },
      )
    } catch (error) {
      console.error('Error running ECS task:', error)
      return new Response(
        JSON.stringify({
          success: false,
          error: error.message || 'Failed to run ECS task',
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Credentials': 'true',
            'Access-Control-Allow-Origin': '*',
          },
        },
      )
    }
  }

  // GET request to list predefined task definitions
  if (request.method === 'GET') {
    try {
      // Get AWS credentials
      const awsAccessKeyId = env.AWS_ACCESS_KEY_ID
      const awsSecretAccessKey = env.AWS_SECRET_ACCESS_KEY

      if (!awsAccessKeyId || !awsSecretAccessKey) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'AWS credentials not configured',
          }),
          {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Credentials': 'true',
              'Access-Control-Allow-Origin': '*',
            },
          },
        )
      }

      // Configure ECS client
      const ecsClient = new ECSClient({
        region: 'ap-southeast-2',
        credentials: {
          accessKeyId: awsAccessKeyId,
          secretAccessKey: awsSecretAccessKey,
        },
      })

      // Fetch all task definitions with pagination
      const allTaskDefinitionArns = []
      let nextToken = undefined

      do {
        const listCommand = new ListTaskDefinitionsCommand({
          nextToken: nextToken,
          maxResults: 100, // Get more results per page
        })
        const response = await ecsClient.send(listCommand)

        if (response.taskDefinitionArns) {
          allTaskDefinitionArns.push(...response.taskDefinitionArns)
        }

        nextToken = response.nextToken
      } while (nextToken)

      // Filter for cron tasks and group by client
      const cronTasks = allTaskDefinitionArns.filter((arn) => arn.includes('cron-roamhq-'))

      const clientGroups = groupTasksByClient(cronTasks)

      // Add network configuration to each client group
      const clientsWithConfig = clientGroups.map((clientGroup) => ({
        ...clientGroup,
        cluster: 'roamhq-cronus-cluster',
        region: 'ap-southeast-2',
        subnets: [
          'subnet-06397f45767bd8d3a',
          'subnet-0812950e351bcce27',
          'subnet-02efc7196b23129a6',
        ],
        securityGroups: ['sg-0068aaf1f29f83c24'],
        assignPublicIp: true,
      }))

      return new Response(JSON.stringify(clientsWithConfig), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Credentials': 'true',
          'Access-Control-Allow-Origin': '*',
        },
      })
    } catch (error) {
      console.error('Error fetching task definitions:', error)
      return new Response(
        JSON.stringify({
          success: false,
          error: error.message || 'Failed to fetch task definitions',
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Credentials': 'true',
            'Access-Control-Allow-Origin': '*',
          },
        },
      )
    }
  }

  return new Response('Method Not Allowed', { status: 405 })
}
