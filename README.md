# About
Manage HubSpot webhooks and subscriptions for your apps. 

Useful when you manage multiple apps and don't want to go through the HubSpot UI to manage webhooks. The only things you need are your HubSpot API key `hapiKey` and the app's ID `appId`.

## Vibe coding
This project started as a series of prompts to [v0.dev](https://v0.dev). There is probably a lot of unused code, but I don't give a damn. This is my [personal software](https://leerob.com/n/personal-software).

### Prompts
> Next.js project without typescript. No shadcnui. Style with tailwind 4. Use server components and app router.
Tiny app that will CRUD HubSpot webhook settings using endpoint: https://api.hubapi.com/webhooks/v3
The only inputs will be appId and hapiKey provided by user.
User can view existing webhook settings and existing event subsriptions. Anything can be edited or deleted.

> Error after submitting credentials
Failed to execute 'json' on 'Response': Unexpected end of JSON input

> It doesnt show any subscriptions even though the call to https://api.hubapi.com/webhooks/v3/${appId}/settings?hapikey=${hapiKey} returns this:
{"results":[{"eventType":"contact.creation","propertyName":null,"active":true,"id":"3315451","createdAt":"2025-03-12T09:29:40.500Z","updatedAt":null},{"eventType":"contact.deletion","propertyName":null,"active":true,"id":"3315032","createdAt":"2025-03-12T09:29:40.500Z","updatedAt":null},{"eventType":"deal.creation","propertyName":null,"active":true,"id":"3315316","createdAt":"2025-03-12T10:02:14.247Z","updatedAt":null}}

> Add option to delete webhook settings

> When the webhook settings are deleted, it shows "Failed to fetch webhook settings". Fix it by showing the form which will do a PUT request

> I dont see "Edit settings" button when this message is dosplayed: "No webhook settings configured. Click "Edit Settings" to create settings."

> Add functionality to delete subscriptions in bulk by checking them. In the background fire 5 API calls in parallel max.

> I get error when updating a subscription eg setting it active
Error updating webhook subscription: SyntaxError: Unexpected end of JSON input at JSON.parse (<anonymous>) at async p (.next/server/app/api/webhooks/subscriptions/[id]/route.js:1:1252)

>Now i get
Error parsing error response: SyntaxError: Unexpected end of JSON input at JSON.parse (<anonymous>) at async p (.next/server/app/api/webhooks/subscriptions/[id]/route.js:1:1297)

Here I ran out of free messages and started porting it to a Next.js project in its own repo.

This took about an hour to set up properly.
- `npx create-next-app@latest`
- copy code from v0.dev

## Next.js
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

### Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.
