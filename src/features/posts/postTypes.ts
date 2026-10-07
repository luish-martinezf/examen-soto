export interface Reactions {
  likes: number
  dislikes: number
}

export interface Post {
  id: number
  title: string
  body: string
  tags: string[]
  reactions: Reactions
  userId: number
}

export interface PostsResponse {
  posts: Post[]
  total: number
  skip: number
  limit: number
}

export interface PostPayload {
  title: string
  body: string
  tags: string[]
  userId: number
}
