import axios from 'axios'
import type { Post } from '../types/posts'

const threadsURL = `/api/threads` // P2
const threadUrl = `/api/thread` // P3
const postsUrl = `/api/posts` // P5

// P2
const getAll = () => {
  const request = axios.get<Post[]>(`${threadsURL}`) 
  return request.then(response => response.data)
}

interface ThreadAnswer {
  thread: Post
  comments: Post[]
}

// P3
const getThread = (id: string) => {
  const request = axios.get<ThreadAnswer>(`${threadUrl}/${id}`)
  return request.then(response => response.data)
}

interface ThreadCreateData {
  content: string
  author?: string
}

// P2
const create = (data: ThreadCreateData) => {
  return axios.post<Post>(`${threadsURL}`, data).then(request => request.data)
}

interface CommentCreateData {
  content: string
  author?: string
  parent?: number
}

// P3
const createComment = (data: CommentCreateData, threadId: number) => {
  return axios.post<Post>(`${threadUrl}/${threadId}`, data).then(request => request.data)
}

// P5
const update = (id: number, newObject: Post) => {
  return axios
    .put<Post>(`${postsUrl}/${id}`, newObject)
    .then(request => request.data)
}

export default {
  getAll,
  getThread,
  create,
  createComment,
  update,
}
