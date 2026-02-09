# Frontend Page

So, the original concept of Fenn is that it will be a command line tool. However:

> **Extended Broker Access**
>
> To access brokerages like Fidelity, Wells Fargo, Empower, and Chase, we submit your app information to these institutions for review. Your URLs must link to legitimate websites, your description must accurately reflect your app, and any custom logo must be valid.
>
> All submissions are reviewed by our team and you'll receive an email notification once your app is approved.

This means, to access these brokers, we need to have a public-facing website. So, the MVP will be a simple frontend that serves as the "home page" for Fenn, where users can learn about the project and get instructions on how to set up the CLI tool.

## Hold on, what does this mean?

Let's hold off on implementation and think through what this means.

This may mean that I will need to approach this project as if it were user-facing product.

I could theme it as invite-only program and have it only work for myself. Or I could theme it as a open source project and have it be available for anyone to use from their local installations. 

The primary goal of Fenn, is to be my personal secretary for my personal finances, and there is no requirements for supporting multiple users.

I do want to make this project into something that CAN be support multiple users but there is zero need for that now.

But I DO want to make sure I have access to Fidelity. Otherwise, I may have to move all my assets back to Robinhood, which is Okay but I want to keep majority of my assets in Fidelity.

## MVP Scope

The idea is that we build a simple frontend that serves as the "home page" for Fenn, where users can learn about the project and get instructions on how to set up the CLI tool.

**OR:** We build it as a public facing app.

**URL**: fenn.sprited.ai
**DESCRIPTION**: Fenn is a personal financial management tool that helps you track and analyze your investment portfolio across multiple brokers. With Fenn, you can easily download your portfolio data from Fidelity, Robinhood, E-Trade, and more, and maintain a local archive of your financial history. Fenn provides a cross-broker view of your holdings, secure credential management, and powerful tools for risk and allocation analysis. Whether you're a seasoned investor or just getting started, Fenn is the ultimate companion for managing your finances with confidence.

## Proposal

We can go full on building out a website. Or we can keep things very simple.

- Option 1: We can have the homepage be a github repo with a README that serves as the homepage.
- Option 2: We can have the homepages be Github Page that serves md files out of docs folder. 
- Option 3: We can have the homepage be a simple React app that serves md files out of docs folder.

Option 2 here is going full on geek-route. I mean it is just as easy to build an app that will run React to give beautiful UI. However, the spirit of this app is that it will be a command line interface where the content matters more than the presentation. 

It's the most unique option I can think of, but it is also risky because Financial companies reviewing them may be turned off by plain text rendering.

Same holds true for the Option 1 as well. Financial companies may treat it as a joke.

Asked Pixel, and the verdict is that we need to make it into a real product if I want to reduce the risk of being rejected by the financial institutions. So, we will go with Option 3.

The homepage will be mostly static. There won't be user-registration.

However be very explicit about why we don't have account login. It is to maximize the security of the user's data. We don't hold any data for you. We are just a tool that helps you download your data from your brokers and store it locally on your machine. We don't have access to your data, and we don't want access to your data.

So, this means we need:

1. Frontend react app that serves as homepage for Fenn.
  - Ability download fenn CLI tool (not sure what is the best method)
2. Cloudflare proxy worker that serves to vend API keys for SnapTrade.
3. Notice saying that this is invite only program. Support can be reached at support@sprited.app
4. Terms and Conditions and Privacy Policy pages.

## Re-Identifying the MVP

> Fenn is an invite-only financial management CLI that allows you to interface with your brokerage accounts through a secure, local tool.

## Service Needed

- Frontend React app for homepage
- Cloudflare proxy worker for API key vending

## Client Needed

- CLI tool that works with the SNAPTRADE USER SECRETS environment secret.
