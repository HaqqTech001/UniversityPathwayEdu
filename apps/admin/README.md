# Administration application

Official staff administration application for University Pathway Educational Consult.

- App entry, authentication and styles: `apps/admin/src/`
- Admin shell, pages, components and types: `apps/admin/src/admin/`
- Staff API and permission enforcement: `apps/api/`
- Public website and student portal: `apps/web/`

The admin app owns its UI and local auth client. It does not import source files from the legacy `apps/ops` application. Both apps may call the same staff API, but builds and source ownership remain separate.

Run `npm install`, `npm run dev`, `npm run lint`, and `npm run build` from this directory. Vite uses port 3100 and proxies `/api` to port 4000 by default.
