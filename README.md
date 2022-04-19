# discordbot

Nodejs Discord Chat Bot

Features:

-   Basic commands to send random submissions from reddit
-   Send Sounds via command
-   Shoutback feature, that "shouts back at you" when your message is all caps
-   Send the Top post of r/hmmm every hour
-   Turn individual features off (Admin Commands)
-   Get definitions from UrbanDictionary
-   Search Wikipedia
-   Create basic polls
-   Get a weather forecast from anywhere
-   Auto reactions to special messages

## Config

Create .env file with the following contents:

```
DISCORD_BOT_TOKEN="YOUR_DISCORD_BOT_TOKEN"

REDDIT_APP_SECRET="REDDIT_APP_SECRET"
REDDIT_APP_ID="REDDIT_APP_ID"
REDDIT_APP_USERNAME="REDDIT_ACCOUNT_USERNAME"
REDDIT_APP_PASSWORD="REDDIT_ACCOUNT_PASSWORD"
```

You can get your Discord bot token here: https://discordapp.com/developers/applications/
Create an App, go to Bot and generate your token.

Reddit App Secret and ID can be created here: https://www.reddit.com/prefs/apps/

## List of commands:

````!help
!ping
!hmmm
!dafuq
!vid
!meirl
!dank
!deepfry
!kitty
!doggo
!nicememe
!oof
!bruh
!source
!poll <question>
!weather <location>
!reddit <subreddit>
!define <term>
!wiki <term>
----------------
Admin commands:
!dumpemoji - dumps all server emoji to a zip file
!setmemechannel - turns hourly posts on and sets the bots 'auto meme' channel (off by default)
!resetmemechannel - turns hourly posts off (why)
!shoutback - turns 'shoutback' on/off (on by default)
!nsfw - allows NSFW posts from !reddit command (off by default, works only in NSFW channels)```
````
