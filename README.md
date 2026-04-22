# Cycle Care Blog

A simple blog website with a custom CMS admin panel.

## Tech Stack
- HTML / CSS / Vanilla JavaScript
- Node.js + Express
- MongoDB Atlas (Mongoose)
- EJS templating
- Multer (image uploads)

## Setup

### 1. Install dependencies
```
npm install
```

### 2. MongoDB connection
Open `app.js` and find this line:
```js
mongoose.connect('mongodb+srv://...');
```
It is already set to your Atlas cluster. If you need to change it, replace the full URI.

### 3. Run locally
```
npm start
```
Visit: http://localhost:3000

## Admin Login
- URL: http://localhost:3000/admin/login
- Username: `admin`
- Password: `admin123`

## Project Structure
```
cyclecare-blog/
├── app.js              ← Express server + all routes
├── models/
│   └── Post.js         ← MongoDB post schema
├── views/
│   ├── layouts/
│   │   ├── header.ejs
│   │   ├── nav.ejs
│   │   └── footer.ejs
│   ├── home.ejs        ← Public homepage
│   ├── post.ejs        ← Single post page
│   └── admin/
│       ├── login.ejs
│       ├── dashboard.ejs
│       ├── new-post.ejs
│       └── edit-post.ejs
├── public/
│   ├── css/style.css
│   ├── js/editor.js
│   └── uploads/        ← Uploaded images stored here
├── package.json
├── vercel.json
└── .gitignore
```

## Deploying to Vercel
1. Push this folder to a GitHub repo
2. Import the repo in Vercel
3. Vercel reads `vercel.json` automatically — no extra config needed
4. Set your MongoDB URI as an environment variable in Vercel dashboard if needed
