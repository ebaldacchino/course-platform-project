This is an adaptation of a [Course Platform LMS Tutorial](https://www.youtube.com/watch?v=OAyQ3Wyyzfg&t=2265s).

## Getting Started

### Install NPM Dependencies

The next step in the setup relies on NPM dependencies. Let's install them:

```bash
pnpm install
```

### Database Setup

This readme will use a docker container to run the [PostgreSQL](https://www.postgresql.org/) database.

Setup [Docker Desktop](https://www.docker.com/products/docker-desktop/) if you haven't already installed it locally.

Add the following environment variables to a `.env` file at the project root:

```env
DB_PASSWORD=password
DB_USER=postgres
DB_NAME=course-platform-video
DB_HOST=localhost
```

**NOTE:** These exact values aren't required, merely defaults.

Run the database:

```bash
docker compose up
```

Setup the database tables using [Drizzle ORM](https://orm.drizzle.team/):

```bash
pnpm run db:generate
pnpm run db:migrate
```

Confirm that your tables have been created by checking [Drizzle Studio](#running-drizzle-studio).

### Authentication

This project relies on [Clerk](https://clerk.com/) as a User Management Platform. You will need to do a bit of setup there.

You will need the sign in and sign up to require an email, first and last names. I personally added Google and Github OAuth.

In VS Code, [forward port 3000](https://code.visualstudio.com/docs/debugtest/port-forwarding). It's visibility needs to be public.

Back to Clerk, setup a webhook for the `user.created`, `user.deleted` and `user.updated` events. Set the target to `https://example-forwarded-port.ms/api/webhooks/clerk`.

**NOTE:** Change the domain name to your forwarded port.

Change the session token to:

```json
{
  "dbId": "{{user.public_metadata.dbId}}",
  "role": "{{user.public_metadata.role}}"
}
```

By the end of the setup, the following environment variables should have been added to your `.env` file:

```env
CLERK_SECRET_KEY=example-key
CLERK_WEBHOOK_SECRET=example-secret
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=example-key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
```

## Running the development server & Drizzle Studio

To start the database and development server:

```bash
docker compose up
# In a new terminal:
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Running Drizzle Studio

To inspect your database visually, run:

```bash
pnpm run db:studio
```

Then navigate to [Drizzle Studio](https://local.drizzle.studio/).
