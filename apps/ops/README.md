# UPEC Operations Application

The staff and administrative workspace is an independent React/Vite application. It is not part of the public/student frontend bundle.

## Development

From this directory, install dependencies with `npm install` and run `npm run dev`. The development server uses port 5174.

## Security status

This is currently a restricted-access application shell, **not** a functional staff portal. Do not deploy privileged workflows until staff identity verification, server-enforced role permissions, application review endpoints and database migration checks are complete. Never reuse a student session as proof of staff authorization.

Set `VITE_PUBLIC_SITE_URL` to the public site origin for the return link. Do not place secrets in `VITE_` environment variables.
