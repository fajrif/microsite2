This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Admin Panel Setup Guide

## Quick Start

1. **Copy environment file:**
   ```bash
   cp env.example .env
   ```

2. **Configure `.env`:**
   - **Supabase Connection Strings:**
     - `DATABASE_URL`: Transaction pooler connection (port 6543)
     - `DIRECT_DATABASE_URL`: Direct connection for migrations (port 5432)
     - Get both from your Supabase project settings → Database → Connection string
   - Generate and add `NEXTAUTH_SECRET`: `openssl rand -base64 32`

3. **Setup database:**
   ```bash
   # Generate Prisma client (Prisma 7)
   npx prisma generate
   
   # Run migrations (creates tables)
   npx prisma migrate dev --name init
   
   # Seed initial data
   npx prisma db seed
   ```

4. **Start server:**
   ```bash
   npm run dev
   ```

5. **Login:**
   - Navigate to `http://localhost:3000/admin`
   - Email: `admin@spotify-adv.com`
   - Password: `Secret1234!`

## Next Steps

- Change the default admin password
- Create categories for your articles
- Start publishing blog content
- Configure Vercel Blob for production images
