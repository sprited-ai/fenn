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

This means we need to:
- Move this project under sprei
- Open source Fenn on GitHub (this repo)