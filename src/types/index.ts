// User and Authentication Types
export interface User {
  id?: string
  username: string
  email?: string
  role?: string
}

export interface AuthState {
  authenticated: boolean
  user: User | null
  isLoading: boolean
}

// DNS Record Types
export interface DnsRecord {
  client: string
  type: string
  host: string
  data: string
}

// Authentication Data Types
export interface AuthEntry {
  hostname: string
  uri: string
  username: string
  password: string
  theme: string
  enabled: boolean
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface TokenResponse {
  token: string
  clientName: string
}

// Form Types
export interface LoginForm {
  username: string
  password: string
}

export interface TokenForm {
  clientName: string
}

// Component Props Types
export interface NotificationProps {
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

// Route Meta Types
export interface RouteMeta {
  requiresAuth?: boolean
  title?: string
  [key: string]: any
}

// ECS Task Types
export interface EcsTask {
  name: string
  taskDefinition: string
}

export interface EcsClientGroup {
  client: string
  displayName: string
  tasks: EcsTask[]
  cluster: string
  region: string
  subnets: string[]
  securityGroups: string[]
  assignPublicIp: boolean
}

export interface EcsTaskResult {
  success: boolean
  taskDefinition: string
  taskArn?: string
  error?: string
}

export interface EcsTaskResponse {
  success: boolean
  partial?: boolean
  results?: {
    successful: EcsTaskResult[]
    failed: EcsTaskResult[]
  }
  taskArn?: string // For backward compatibility
  error?: string
  message?: string
}

// Client Types
export interface Client {
  id?: number
  name: string
  origin: string
  hostname: string
  enabled: boolean
}

export interface ClientForm {
  name: string
  origin: string
  hostname: string
  enabled: boolean
}
