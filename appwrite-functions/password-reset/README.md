# Password Reset Function

This Appwrite Function force-updates the current authenticated user's password using the Server SDK.

## Why this exists

The mobile app uses Email OTP for identity proof (`createEmailToken` + `createSession`).
The final password update is completed server-side with `users.updatePassword` to avoid client-side session limitations.

## Runtime

- Node.js 18+
- Entry: `src/main.js`

## Required function environment variables

- `APPWRITE_API_KEY`: Server key with `users.write` scope.

The following are usually provided by Appwrite automatically in Functions runtime:

- `APPWRITE_FUNCTION_API_ENDPOINT`
- `APPWRITE_FUNCTION_PROJECT_ID`

## Client app env variable

Set this in your app environment:

- `EXPO_PUBLIC_APPWRITE_PASSWORD_RESET_FUNCTION_ID=<your_function_id>`

The app calls this function from `completePasswordReset` in `context/AuthProvider.tsx`.

## Security checks in function

- Requires authenticated user context (`x-appwrite-user-id` header).
- Rejects if payload `userId` does not match authenticated user.
- Enforces minimum password length before update.
