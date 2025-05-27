# Monolith Frontend

This project is the frontend for the Monolith application, built with Next.js, TypeScript, and Tailwind CSS. It includes features like a waitlist form with Cloudflare Turnstile verification and a landing and waitlist page.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Node.js (v18 or later recommended)
- pnpm (or npm/yarn if you prefer, though `pnpm-lock.yaml` is present)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd monolith-new-client
    ```

2.  **Install dependencies:**
    If using pnpm:
    ```bash
    pnpm install
    ```
    Or npm:
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env.local` file in the root of the project by copying the example below. **Important:** Add this file to your `.gitignore` if it's not already there to prevent committing sensitive keys.

    ```env
    # .env.local

    # Cloudflare Turnstile Keys (replace with your actual keys or test keys)
    # For local testing with "always passes" keys:
    NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA
    TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA0000000

    # Backend API URL
    FASTAPI_BASE_URL=http://localhost:8000 # Or your actual backend URL
    ```
    - Get your Cloudflare Turnstile keys from the [Cloudflare Dashboard](https://dash.cloudflare.com/).
    - `FASTAPI_BASE_URL` should point to your running backend service.

4.  **Run the development server:**
    ```bash
    pnpm dev
    ```
    Or npm:
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Available Scripts

In the project directory, you can run:

-   `pnpm dev` or `npm run dev`:
    Runs the app in development mode.
-   `pnpm build` or `npm run build`:
    Builds the app for production to the `.next` folder.
-   `pnpm start` or `npm run start`:
    Starts the production server (requires a build first).
-   `pnpm lint` or `npm run lint`:
    Runs Next.js's built-in ESLint checks.

## Key Technologies Used

-   [Next.js](https://nextjs.org/) - React framework for production
-   [TypeScript](https://www.typescriptlang.org/) - Typed JavaScript
-   [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
-   [shadcn/ui](https://ui.shadcn.com/) - UI components built with Radix UI and Tailwind CSS
-   [Lucide React](https://lucide.dev/) - Icon library
-   [Framer Motion](https://www.framer.com/motion/) - Animation library
-   [React Hook Form](https://react-hook-form.com/) - Form handling
-   [Zod](https://zod.dev/) - TypeScript-first schema validation
-   [Cloudflare Turnstile](https://www.cloudflare.com/products/turnstile/) - Bot protection

## Folder Structure Overview

```
monolith-new-client/
├── app/ # Next.js App Router: pages, layouts, API routes
│   ├── api/ # Server-side API routes
│   ├── (landing)/ # Route groups for landing pages
│   └── ... # Other pages and layouts
├── components/ # Shared React components
│   ├── landing/ # Components specific to the landing page
│   └── ui/ # General UI components (likely from shadcn/ui)
├── lib/ # Utility functions, constants, etc.
│   └── countries.ts # List of countries for forms
├── public/ # Static assets (images, fonts, etc.)
├── .env.local # Environment variables (gitignored)
├── next.config.mjs # Next.js configuration
├── package.json # Project dependencies and scripts
├── tsconfig.json # TypeScript configuration
└── tailwind.config.ts # Tailwind CSS configuration
```

## Deployment

This project is configured for deployment on [Vercel](https://vercel.com/) (see `vercel.json`).

When deploying, ensure you set the required environment variables (`NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`, `FASTAPI_BASE_URL`) in your Vercel project settings.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request with your changes.

(Add more specific contribution guidelines if needed)

## License

This project is licensed under the MIT License - see the LICENSE.md file for details (if one exists, otherwise choose a license e.g., MIT).