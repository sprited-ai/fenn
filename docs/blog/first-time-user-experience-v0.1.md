# First Time User Experience

Once user installs it, they need to first log in to use it.

**Why does user need to login at all?** So, there are two SECRETs involved.

- Service level SECRET for SNAPTRADE (in Cloudflare Worker).
- This allows for creation of "USER"s (i.e. USER SECRET).

**So what does the FTU do?**

They will need to sign up first using Google OAuth.

Because our theme is "local" tool, I think even the signup/login should be from the local client instead of from the webpage. 

When they install it, we will ask the users to run command to signup.

`fenn signup` navigates to Google OAuth page to signup.

`fenn login` navigates to Google OAuth page to login.

The login will be done via Supabase Auth.

And user should have unique identifier which is going to be the same as SnapTrade's USER ID.

USER SECRET will not be stored in our Supabase. It shall be stored in user's local computer keychain along with the Supabase authentication.

Once signed up, user can then do:

`fenn connect`

which shall bring up web ui to link the accounts (this is from SnapTrade).

Then, user can do:

`fenn pull` to download their portfolio information from the financial institutions.

They can also list using `fenn list` to list out connections.

Finally, we will also have Fenn MCP and Skills.

So I can use it from my VSCode Copilot etc.