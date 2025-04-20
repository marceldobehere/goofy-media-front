# Custom CSS
You can add custom css to the entire page in the `Local Settings`!

There is an overview showing the styles and what you need to use in the Custom CSS textarea.

# Example

If this is in your Custom CSS textarea, the Navigation will be red and all posts on the homepage will be orange.
```css
.UL_LeftNavDiv {
	color: red;
}

.H_PostDiv {
	color: orange;
}
```




# Overview
This is an overview of all the styles used in the site. 

You can use these in your custom CSS to change the look of the site.
```json
{
  "UnifiedLayout": {
    "UL_MainPageMenu": unifiedStyles.MainPageMenu,
    "UL_MainDivContainer": unifiedStyles.MainDivContainer,
    "UL_LeftNavDiv": unifiedStyles.LeftNavDiv,
    "UL_MainDiv": unifiedStyles.MainDiv,
    "UL_RightDiv": unifiedStyles.RightDiv,
    "UL_LeftNavDivDesktop": unifiedStyles.LeftNavDivDesktop,
    "UL_LeftNavDivMobileHeader": unifiedStyles.LeftNavDivMobileHeader,
    "UL_NavMobileHeader": unifiedStyles.NavMobileHeader,
    "UL_LeftNavDivMobileBody": unifiedStyles.LeftNavDivMobileBody,
    "UL_GoofyFont": unifiedStyles.GoofyFont,
  },
  "Login": {
    "L_Page": loginStyles.page,
    "L_OtherList": loginStyles.OtherList,
  },
  "Register": {
    "R_Page": registerStyles.page,
    "R_OtherList": registerStyles.OtherList,
  },
  "Search": {
    "S_SearchLabel": searchStyles.SearchLabel,
    "S_SearchInput": searchStyles.SearchInput,
    "S_SearchButton": searchStyles.SearchButton,
    "S_SearchResBox": searchStyles.SearchResBox,
    "S_TagDiv": searchStyles.TagDiv,
    "S_LinkDiv": searchStyles.LinkDiv,
  },
  "LocalSettings": {
    "LS_MainDiv": localSettingsStyles.MainDiv,
    "LS_FirstSection": localSettingsStyles.FirstSection,
    "LS_TrustedUrlsInput": localSettingsStyles.TrustedUrlsInput,
    "LS_CssTextArea": localSettingsStyles.CssTextArea,
    "LS_FeedbackTextArea": localSettingsStyles.FeedbackTextArea,
    "LS_LastButtons": localSettingsStyles.LastButtons,
  },
  "Homepage": {
    "H_PostDiv": homepageStyles.PostDiv,
    "H_NewsDiv": homepageStyles.NewsDiv,
  },
  "PostComposer": {
    "PC_MainContainer": postComposerStyles.MainContainer,
    "PC_TagSearchList": postComposerStyles.TagSearchList,
    "PC_CreatePostButtons": postComposerStyles.CreatePostButtons,
  },
  "Profile": {
    "P_PostList": profileStyles.PostList,
    "P_ShareBtn": profileStyles.ShareBtn,
    "P_ViewingProfileDiv": profileStyles.ViewingProfileDiv,
    "P_MainInfo": profileStyles.MainInfo,
    "P_Bio": profileStyles.Bio,
    "P_Links": profileStyles.Links,
    "P_PinnedPost": profileStyles.PinnedPost,
    "P_FollowBtn": profileStyles.FollowBtn,
  },
  "PublicInfo": {
    "PI_MainDiv": publicInfoStyles.MainDiv,
    "PI_FinalButtonContainer": publicInfoStyles.FinalButtonContainer,
  },
  "FollowerEntry": {
    "FE_UserEntry": followerEntryStyles.UserEntry,
    "FE_UserLink": followerEntryStyles.UserLink,
  },
  "PostEntry": {
    "PE_PostEntryDiv": postEntryStyles.PostEntryDiv,
    "PE_PostUserHeader": postEntryStyles.PostUserHeader,
    "PE_PostBody": postEntryStyles.PostBody,
    "PE_PostTags": postEntryStyles.PostTags,
    "PE_PostEntryFooter": postEntryStyles.PostEntryFooter,
  },
  "NotificationEntry": {
    "NE_NotificationEntryDiv": notificationEntryStyles.NotificationEntryDiv,
    "NE_NotificationEntryDivStart": notificationEntryStyles.NotificationEntryDivStart,
  },
  "CommentEntry": {
    "CE_CommentDiv": commentEntryStyles.CommentDiv,
    "CE_CommentUserHeader": commentEntryStyles.CommentUserHeader,
    "CE_CommentBody": commentEntryStyles.CommentBody,
    "CE_CommentFooter": commentEntryStyles.CommentFooter,
  }
}
```

# Details
Here are the detailed CSS classes for each page / component alongside some notes.

## General

### General / Global Stuff
```css
/*Used Throughout the entire site*/
html
body
h1, h2, h3
input, button
main

/*Used mostly in login, register and the post composer*/
.container
.cont-inp-header
.cont-inp
.cont-btn
.cont-inp-btn

/*Assistant stuff*/
#main-assistant-div /*The Glowing ?*/
#main-assistant-body-div /*The dark bg around the Main Body*/ 
#main-assistant-body-div > div /*The Main Body of the assistant text*/

/*The silly spinner on the bottom left*/
#main-loading-div
```

### General / Global Variables
```css
:root {
    --background: #0a0a0a;
    --foreground: #ededed;

    --footer-size: 4rem;
    --text-gray: #c3c3c3; /*Also used as the border for many things*/

    --central-background: #161b4a;
    --nav-mobile-background: #1b1444;
    --nav-body-mobile-background: #0d045c;
    --nav-body-mobile-border: #1b59b0;
    --nav-background: #181d4f;
    --nav-link-background: #050c27;
    --nav-link-hover-background: #364599;

    --assistant-background: #111540;

    --post-border: #5372e0;
    --post-background: rgba(0, 0, 0, 0.2);

    --comment-spacing: 1rem;
  
    --container-border: #5f7bde;
    --account-settings-background: #0b1434;
}

```

### Unified Layout
```css

.MainPageMenu /*Is the entire page*/
.MainDivContainer /*The main grid*/

/*The three main sections*/
.LeftNavDiv 
.MainDiv
.RightDiv

/*Nav for Desktop*/
.LeftNavDivDesktop
.LeftNavDivDesktop a

/*Entire Top Bar For Mobile*/
.LeftNavDivMobileHeader
.LeftNavDivMobileHeader button

/*Top Bar Header For Mobile*/
.NavMobileHeader
.NavMobileHeader a

  /*Nav Body for Mobile*/
.LeftNavDivMobileBody
.LeftNavDivMobileBody p
.LeftNavDivMobileBody a

/*Silly Font for the word "Goofy"*/
.GoofyFont
```

### Unified Layout CSS Variables
```css
.MainPageMenu {
    --inner-padding: 0.5rem;
    --extra-space: 0.5vw;
    --left-size: 25vw;
    --center-size: 50vw;
    --right-size: 25vw;
    --header-size: 4rem;
    --min-height: calc(100vh - var(--footer-size));
    --min-height-body: calc(100vh - var(--footer-size) - var(--header-size));
}
```


## Pages


### Login
```css
.page /*Has the BG*/

/*List Of Login Options*/
.OtherList
.OtherList a
```

### Register
```css
.page /*Has the BG*/

/*List Of Register Options*/
.OtherList
.OtherList button
.OtherList a /*Link to go back to Login*/
```

### Search
```css
.SearchLabel
.SearchInput
.SearchButton

.SearchResBox

/*Tag Entry*/
.TagDiv
.TagDiv a

/*User Entry*/
.LinkDiv
.LinkDiv a
.LinkDiv span
```

### Local Settings
```css
.MainDiv
.MainDiv button

.FirstSection button

.TrustedUrlsInput
.TrustedUrlsInputButton

.CssTextArea
.FeedbackTextArea

.LastButtons button
```

### Homepage
```css
.PostDiv
.PostDiv > ul
.PostDiv > ul > li

.NewsDiv
.NewsDiv > ul
.NewsDiv > ul >li
```

### Post Composer
```css
.MainContainer

.TagSearchList
.TagSearchList > div
.TagSearchList > div > ul > li

.CreatePostButtons
.CreatePostButtonsBtn
```

### Profile
```css
.PostList > ul > li
.PostList > ul > li > div

.ShareBtn
.ShareBtnNo
.ShareBtnClicked

/*Header + Share Button*/
.ViewingProfileDiv
.ViewingProfileDiv h3
.ViewingProfileDiv img


.MainInfo
.MainInfo img

.Bio

.Links

.PinnedPost
.PinnedPost > h3
.PinnedPost > div

.FollowBtn
```

### Public Info
```css
.MainDiv
.MainDiv h3
.MainDiv input
.MainDiv textarea
.MainDiv img
.MainDiv button

.FinalButtonContainer
.FinalButtonContainer button 
```

## Components / Entries

### Followers/Following - User Entry
```css
.UserEntry
.UserEntry > img
.UserEntry > span

.UserLink
.UserIdLink
```

### Post Entry
```css
.PostEntryDiv
.PostEntryDiv hr

/*Header for User*/
.PostUserHeader
/*PFP + Share Button*/
.PostUserHeader img
/*Header Text*/
.PostUserHeaderSpan

.ShareBtn
.ShareBtnNo /*Disabled*/
.ShareBtnClicked


.PostEntryHeader

.PostBody
.PostBody h1, 
.PostBody h2, 
.PostBody h3, 
.PostBody h4, 
.PostBody h5, 
.PostBody h6
.PostBody ul
.PostBody ol
.PostBody li

/*Tag List*/
.PostTags
.PostTags span

.PostEntryFooter
.PostEntryFooter button
```

### Notification Entry
```css

.NotificationEntryDiv
.NotificationEntryDiv hr

/*Main Header Grid*/
.NotificationEntryDivStart

/*Notification PFP*/
.NotificationEntryDivStart > img

.Unread
.Read
```

### Comment Entry
```css
.CommentDiv
.CommentDiv hr

/*Header Grid*/
.CommentUserHeader

/*Comment PFP*/
.CommentUserHeader img

/*Comment Header Text*/
.CommentUserHeaderSpan

.CommentBody

.CommentFooter
.CommentFooter h4

/*Buttons*/
.CommentButtonDiv button
    
/*Reply List*/
.CommentDiv ul
```