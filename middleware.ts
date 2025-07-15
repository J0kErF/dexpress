import { clerkMiddleware } from '@clerk/nextjs/server';

const middleware = clerkMiddleware({
  publicRoutes: ["/"], // 👈 Only homepage is public
});

export default middleware;

export const config = {
  matcher: [
    // Run middleware only for these routes
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
