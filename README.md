# Goofy Media

This is the frontend for Goofy Media written int NextJS.

It is statically hosted [here](https://marceldobehere.github.io/goofy-media-front/).

Backend is [here](https://github.com/marceldobehere/goofy-media-back).

If you want to register an account, just send me a message on discord or reach out.

## Screenshots

![index](./imgs/index.png)

![home](./imgs/home.png)




## General Infos

### Security
Users have a public/private keypair that is used to encrypt and verify/sign data.

The public key is integrated in the user profile and in the generated handle.

The private key can be stored locally on the device or by using a username and password it can be stored on the server encrypted, so that only the user can ever decrypt and access it.
When registering, you can choose whether you want to store the private key on the server or not.

Every post, comment, follow, like, etc. gets signed, so that the server and the other users can verify the authenticity of the data. 
This means that an evil server cannot tamper with posts, comments, etc. without them being marked as invalid. (Outside of deleting entries)

Additionally there are no sessions, all requests from the client are signed with the private key and the server can verify them using the public key.
This is pretty useful since every request is validated and the server can be restarted/updated without logging out users.

### Decentralization
Goofy Media aims to be a decentralized social media platform.

The intended use-case is to open an instance for a group of friends or a small community.

Each instance can be accessed but they are normally isolated from each other.

Though, if wanted, several servers can join together into a cluster and essentially act as one big server.
(Of course things like moderation and user management is up to the instances themselves. And also this is still WIP)

### Server Privacy
When you host a server instance, you can select which parts of the server can be publically accessed and which parts are private.

A server can be fully public with guests being able to access it or fully private, only accessible to registered/trusted users.

(This feature is also WIP)

### User Privacy
User accounts do not require emails or any other personal information. 
The only important thing is the registration code, which you will need to get from a server administrator.

You can also use a username and password to store your private key on the server, but this is not required.
Additionally the password is not stored on the server, it is merely used as a encryption key to encrypt the private data and only a hash of the username gets stored on the server.

Outside of that the server does store necessary information like the public key, the handle, posts, comments and such.

(A feature to request and or delete your data is planned)

### DMs
DMs are not implemented yet, but they are planned.

Users will be able to send DMs to other users, which will be End-to-End encrypted by default.

DM messages will be stored on the server, but they will be stored encrypted and only the sender and receiver will be able to decrypt them.

Detailed info will follow when the feature is implemented.

### Server Rules
Please do not post any illegal content on Goofy Media or anything that would violate the rules of the server you are using.

Specific server rules will be added but for now the most important thing is no illegal or inappropriate content, using some commonsense.


### Styling Info
Posts can be styled using markdown.
```
# Hi
This is a *very* **cool** text.

* This
* is
* a
* list

## Bla Bla
yes this also works

```

Additionally, pictures, videos and audios can be embedded using `![alt text](url)`

Embedded media can autoload depending on the user settings. Autoloading is off by default for security reasons.

There is also syntax highlighting for code blocks:
```
Replace all the ' with `
'''js
code goes here
'''
```



Custom css can also be added for blocks by using the following `<style "...">...</style>` "element":
```html
<style "border:4px solid red;width:250px;height:350px;font-family:'Comic Sans MS';background:radial-gradient(red, green, blue);">
  This is a test element
  It is very cool
</style>
```
Most properties will work just fine. Notable exclusions are `position` and any URLs.

custom css can be disabled in the account settings as well as animations

Silly example of cursed css by @mrhax00: (You'll need to remove the `-` before the `)
```html
<style "font-size: .7em; transform: rotate(-10deg) scale(120%, 120%) translate(4em, 0em); outline: #0e0e42 solid 100em">
-```bash
while [ "$Missing" = "1" ]; do
        echo -n ",["
        
        StartBlock
                StrProp name error
                StrProp full_text "Too few or invalid arguments. "
                StrProp color "#ff0000"
        EndBlock

        echo "]"
        SeperateBlock=0 # drawing by nona
        sleep 1
done
-```
</style>

<style "transform: translate(10vw, -10em)">
<style "font-size: .3em; animation: spin 4s ease-in-out infinite; margin:auto;">
<style "font-size: 50em; animation: spin 4s ease-in-out reverse infinite; margin:auto; width: 1em">
<style "animation: spin 6s ease-in-out reverse infinite; margin:auto; width: 1em; height: 1em">
<style "animation: spin 6s .2s ease-in-out infinite; margin:auto; width: 1em; height: 1em">
![](https://www.dropbox.com/scl/fi/hrl93hfm1p6nkb4bvdkgh/I_like_my_background_empty_bruh.png?rlkey=fo310ev7gvj9wn3ynvenrexqf&st=00f25wk3&raw=1)
</style></style></style></style></style>
```

## Features
Goofy Media is still a WIP and far from done but it has enough features to be usable currently.

Note that its just me working on this in my free time, so don't expect constant updates and 24/7 support.

### Implemented
Here are some of the implemented features:
* [X] A Cool Index Page
* [X] Functional UI (will improve with time)
* [X] Basic User System with Registration, Login and Logout (Users and Admins)
* [X] Admin Dashboard
* [X] Registration Code System
* [X] Full Server data export and import in JSON format 
* [X] Post System with support for markdown, css, embedded media and user mentions
* [X] Post composer with all of the support as well as a preview
* [X] Post creation
* [X] Automatic Post verification
* [X] Global Feed
* [X] News Feed
* [X] Tag System
* [X] Tag Search (With post counts)
* [X] Post Tag Validation
* [X] Home Page with infinite scroll and dynamic post loading
* [X] Profile Page
* [X] Account Settings (Including custom CSS overrides and cool settings)
* [X] Comment System with support for nested comments
* [X] Like System (Liking, Unliking, showing liked posts)
* [X] Follow System (Following, Unfollowing, showing following and followers)
* [X] User Feed based on the followed users
* [X] Notification System (Follows, Likes, Comments, Mentions)
* [X] Notification Page
* [X] User Feedback
* [X] QR Code login (Generation and upload of QR codes to log in)
* [X] Short-Links for posts and user profiles
* [X] Responsive Design with support for mobile devices
* [X] Support for guest users
* [X] Client-side caching of data
* [X] Live Notification polling
* [X] Homepage toggle for users to switch between Personal Feed and Global Feed
* [X] Unified UI System
* [X] Live Post Preview (For Desktop Users)
* [X] Basic image upload using https://files.catbox.moe/
* [X] Adding some trusted domains for embedded media
* [X] Basic Public User Profile / Information
  * [X] Display Name
  * [X] Basic Profile Settings
  * [X] Profile Bio
  * [X] Profile Pronouns
  * [X] Profile Links
  * [X] Pinned Post


### TODOs
Here are some of my TODOs:
* [ ] Showing Display Names for Following and Followers
* [ ] Better Post Style Guide
* [ ] Converting :emojis: in Posts and comments
* [ ] Improving the Post Entry Component to not do silly DOM shenanigans
* [ ] Getting the raw post body (Either a button or a setting)
* [ ] Some kind of privacy policy / GDPR notice
* [ ] Password rules for registration (enforced by the client)
* [ ] Optional Anonymous Feedback
* [ ] Bug reporting (Unsure if Registered Only or also Guests)
* [ ] Improve Custom CSS and add some premade themes to choose from
* [ ] Automatic Daily/Weekly/Monthly Backups with a max amount of backups
* [ ] Clicking on embedded media opens it in a new tab
* [ ] Seeing who liked your post
* [ ] Listing most common/used tags? (Maybe 24h, a week, a month or all time)
* [ ] Bookmarking Tags (Bookmarking, Unbookmarking, showing bookmarked tags, Feed for bookmarked tags)
* [ ] Post editing
* [ ] Post deletion
* [ ] Comment deletion
* [ ] Delete user and all user data
* [ ] Export all user data
* [ ] API Rate Limiting
* [ ] Post sharing
* [ ] Probably Keeping the tag order correctly (currently auto sorted alphabetically)
* [ ] Blocking System (Blocking, Seeing blocked users, unblocking, automatic filtering of content from blocked users)
* [ ] Improved Commenting UI
* [ ] Short Links including metadata for embedding on other sites
* [ ] Basic Admin Moderation (deleting posts, comments, users) (All actions will be signed and stored in a different table or something)
* [ ] Reporting System
    * [ ] Post reporting
    * [ ] User reporting
    * [ ] Comment reporting
    * [ ] Tag reporting
* [ ] Client side like and follow validation
* [ ] Improved Homepage UI for the News Feed (Maybe a toggle or something)
* [ ] Actual Designs and Improved UI
* [ ] Simple Guide to host a server for free/cheap
* [ ] Content Warning System
  * [ ] Post Content Warnings
  * [ ] Profile Content Warnings
  * [ ] Post Content Warning Settings
  * [ ] Potentially hide / filter out posts with content warnings
* [ ] Improved Public User Profile / Information
  * [ ] Profile Picture
  * [ ] Profile Bio with Markdown
  * [ ] Profile Links with Markdown
  * [ ] Profile Custom CSS
  * [ ] Profile Banner
  * [ ] Improved Settings + Display
* [ ] User search (by handle or display name)
* [ ] Potentially post search by text (posts that contain ...)
* [ ] Server Lockdown / Privacy Settings (Decide how public endpoints are)
* [ ] Direct Messaging System (Planning on having a limited amount of DMs per user for data storage reasons)
* [ ] Notification filtering
  * [ ] Potentially stopping/muting notifications for certain posts & comments
* [ ] Polling system (Posts will be able to have simple polls)
* [ ] Comment Links + Improved Highlighting of replies
* [ ] Clustering System (Will be a lot of work, especially with queries having to go over distributed resources)
* [ ] Better Admin Dashboard
  * [ ] User Management
  * [ ] Post Management
  * [ ] Comment Management
  * [ ] Tag Management
  * [ ] Server Management
  * [ ] Server Settings
  * [ ] Cluster Management
  * [ ] Server Statistics?
  * [ ] Server Logs?
  * [ ] Server / Database Monitoring?
* [ ] More User Types / Permissions for Moderators, Admins and Server Owners
* [ ] Extra Page for Featured / "Advertisement" / Donation Content
  * Users may pay the server owner / donate / etc. to have a post of them up on the extra page for a specified amount of time (For example 24h)
  * This page can be accessed from the home page navigation and the posts wont be highlighted anywhere else
  * This is meant as a way to support the server costs and to advertise your content/offers/services in a non-intrusive way
  * This page is optional to visit and optional for the server owner to implement/use, potentially might be good to limit the post spots too?
  * Maybe add grouping to the page based on topics/tags
* [ ] Docs for writing bots + Example code?
* [ ] Improving Trusted Domains (As a setting with a list of domains)
* [ ] Potentially (optional) Push Notifications
* [ ] Potentially posts with HTML/CSS/JS embedded as iframes
* [ ] Potentially support for ActivityPub / RSS for public servers
* [ ] Live Notification polling using WS
* [ ] Scanning QR Codes with the camera to log in
* [ ] Potentially adding tag grouping?
* [ ] Improving Client Caching
* [ ] Improving Backend Caching
* [ ] Improve Credits


## Development

### Local Dev
You need node to run this
* Clone the repo and navigate to the folder
* `npm i`
* `npm run dev`
* Visit the website being logged, usually http://localhost:3010/goofy-media-front
* Profit

### Hosting a custom client on Github
You can just fork the repo, go into actions and enable them.

For each new commit the actions will build the project and deploy it to the url `https://[username].github.io/goofy-media-front/`.



## Credits

I used parts from goofy chat 2 and other projects so mostly my black magic code.

Also thanks for [@PossiblyExo](https://github.com/PossiblyExo) for some help with the design.

Credits for the backend can be found [here](https://github.com/marceldobehere/goofy-media-back).

### Libraries
* Express
* JSEncrypt
* Marked.js
* QRCodeGenerator
* Highlight.js
* LZString
* Purify
* CryptoJS
* JSQR
