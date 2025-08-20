# Real-Time Social Media App

A full-stack social media application built with Next.js, featuring real-time notifications, post creation with image uploads, likes, and comments. The app leverages TypeScript for type safety, MongoDB for data storage, Socket.IO for real-time communication, and ImageKit for image management. Deployed on Vercel for a seamless serverless experience.

## Live Demo

Check out the live application at: []()  

## Features

- **User Authentication**: Secure login/signup using NextAuth with JWT and credentials provider.
- **Post Creation**: Create posts with text content and optional image uploads (via ImageKit).
- **Feed Display**: View posts from followed users with pagination and an `isLiked` indicator.
- **Likes and Comments**: Like or comment on posts with a smooth UI experience (GIF animations for likes, comment input).
- **Real-Time Notifications**: Receive instant notifications for likes and comments on your posts using Socket.IO.
- **Responsive Design**: Mobile-friendly UI styled with Tailwind CSS.
- **Type Safety**: Fully type-safe codebase using TypeScript, ensuring robust development and deployment.
- **Debounced Actions**: Optimized user interactions (e.g., likes, searches) using a custom `useDebounce` hook.
- **Image Uploads**: Secure and efficient image uploads to ImageKit with cleanup of temporary files.

## Technologies

- **Frontend**: Next.js (App Router, React), TypeScript, Tailwind CSS, `react-hot-toast`
- **Backend**: Node.js, MongoDB with Mongoose, Socket.IO, NextAuth (JWT)
- **Image Management**: ImageKit for uploading and serving images
- **Deployment**: Vercel (serverless, WebSocket support)
- **Utilities**: `formidable` for multipart form parsing, `useDebounce` for optimized interactions
- **Type Safety**: Strict TypeScript configuration with no `any` types

## Project Structure

- `src/app/api/`: API routes (`/posts`, `/posts/like`, `/feed/my-feed`, `/socket`, `/auth/[...nextauth]`)
- `src/components/`: UI components (e.g., `PostCard` for displaying posts)
- `src/models/`: Mongoose schemas (`PostModel`, `UserModel`, `CommentModel`)
- `src/lib/`: Utilities (`toNodeStream`, `uploadImages`, `socket`)
- `src/hooks/`: Custom hooks (`useDebounce`, `useSocket`)

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud, e.g., MongoDB Atlas)
- ImageKit account for image uploads
- Vercel account for deployment

## Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/vivek-krishan/social-media-vegastack
cd your-repo
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the root directory and add:
```env
MONGODB_URI=your_mongodb_uri
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret
imageKit_Public_Key=your_imagekit_public_key
imageKit_Private_Key=your_imagekit_private_key
imageKit_Url_Endpoint=your_imagekit_url_endpoint
```

### 4. Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production
```bash
npm run build
npm run start
```

### 6. Deploy to Vercel
1. Push to a GitHub repository:
   ```bash
   git push origin main
   ```
2. Connect to Vercel:
   ```bash
   vercel
   ```
3. Add environment variables in Vercel dashboard (same as `.env.local`).
4. Deploy:
   ```bash
   vercel --prod
   ```

## API Routes

- **GET `/api/feed/my-feed`**: Fetch paginated posts from followed users with `isLiked` indicator.
- **PATCH `/api/posts/like`**: Like or unlike a post, triggers Socket.IO notification.
- **POST `/api/posts/comment`**: Add a comment to a post, triggers notification.
- **POST `/api/posts`**: Create a post with text and optional image (ImageKit upload).
- **GET `/api/socket`**: Initialize Socket.IO for real-time notifications.

## Future Enhancements

- Persist notifications in MongoDB for history.
- Display comments in `PostCard` component.
- Add Redis adapter for Socket.IO scalability.
- Support multiple image uploads per post.
- Implement search functionality with debounced queries.

## Known Issues

- Ensure all environment variables are set correctly to avoid runtime errors.
- Temporary files from `formidable` are cleaned up after ImageKit uploads.
- TypeScript errors were resolved by removing all `any` types across the codebase.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request on GitHub.

## Contact

For feedback or questions, reach out to [vivekkrishan0@gmail.com](mailto:vivekkrishan0@gmail.com) or open an issue on the repository.