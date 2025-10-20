// Helper script to generate task definitions from AWS ECS
// This parses task definition names in the format: cron-roamhq-{client}-{taskname}

function parseTaskDefinition(taskDefArn) {
  // Extract task definition name from ARN
  const match = taskDefArn.match(/task-definition\/(cron-roamhq-[^:]+)/)
  if (!match) return null

  const fullName = match[1]

  // Parse pattern: cron-roamhq-{client}-{taskname}
  const parts = fullName.split('-')

  // Need at least: cron, roamhq, client, taskname
  if (parts.length < 4 || parts[0] !== 'cron' || parts[1] !== 'roamhq') {
    return null
  }

  const client = parts[2]
  const taskName = parts.slice(3).join('-')

  return {
    client,
    taskName,
    fullTaskDefinition: fullName,
  }
}

function groupTasksByClient(taskDefinitionArns) {
  const clientMap = new Map()

  for (const arn of taskDefinitionArns) {
    const parsed = parseTaskDefinition(arn)
    if (!parsed) continue

    if (!clientMap.has(parsed.client)) {
      clientMap.set(parsed.client, [])
    }

    clientMap.get(parsed.client).push({
      name: formatTaskName(parsed.taskName),
      taskDefinition: parsed.fullTaskDefinition,
    })
  }

  // Convert to array format
  const clients = []
  for (const [clientName, tasks] of clientMap.entries()) {
    clients.push({
      client: clientName,
      displayName: formatClientName(clientName),
      tasks: tasks,
    })
  }

  // Sort clients alphabetically
  clients.sort((a, b) => a.displayName.localeCompare(b.displayName))

  return clients
}

function formatTaskName(taskName) {
  // Convert kebab-case to Title Case
  return taskName
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function formatClientName(client) {
  // Special cases for client names
  const specialCases = {
    beg: 'BEG',
    mrt: 'MRT',
    mudgee1: 'Mudgee',
    phillipisland: 'Phillip Island',
    portmacquarie: 'Port Macquarie',
    swanvalley: 'Swan Valley',
    tourismbowen: 'Tourism Bowen',
    geelongbellarine: 'Geelong Bellarine',
    goldenoutback: 'Golden Outback',
    lovewestside: 'Love Westside',
    northofthemurray: 'North of the Murray',
    bourkeshire: 'Bourke Shire',
    coralcoast: 'Coral Coast',
    yarraranges: 'Yarra Ranges',
    whitsundays: 'Whitsundays',
    vicheartland: 'Vic Heartland',
    grampians: 'Grampians',
    melbournenow: 'Melbourne Now',
  }

  return specialCases[client] || client.charAt(0).toUpperCase() + client.slice(1)
}

export { parseTaskDefinition, groupTasksByClient, formatTaskName, formatClientName }
