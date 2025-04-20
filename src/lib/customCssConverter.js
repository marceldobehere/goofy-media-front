'use client';

function getAllAvailableClasses(data) {
    if (data == undefined)
        data = supportedComponents;

    let allClasses = [];
    for (let key in data) {
        let obj = data[key];
        if (typeof obj === "object")
            allClasses.push(...getAllAvailableClasses(obj));
        else
            allClasses.push({key: key, value: obj});
    }
    return allClasses;
}

export function getAllAvailableClassNames() {
    let allClasses = getAllAvailableClasses();
    return allClasses.map(x => x.key);
}

export function convertCssString(input) {
    const allClasses = getAllAvailableClasses();
    let output = input;
    for (let {key, value} of allClasses) {
        output = output.replaceAll("#" + key + "{", "#" + value + "{");
        output = output.replaceAll("." + key + "{", "." + value + "{");
        output = output.replaceAll("#" + key + " ", "#" + value + " ");
        output = output.replaceAll("." + key + " ", "." + value + " ");
    }
    return output;
}



import unifiedStyles from "@/comp/unified_layout/unifiedMenu.module.css";
import loginStyles from "@/app/guest/login/page.module.css";
import registerStyles from "@/app/guest/register/page.module.css";
import searchStyles from "@/app/guest/search/page.module.css";
import localSettingsStyles from "@/app/user/account_settings/page.module.css";
import homepageStyles from "@/app/user/home/page.module.css";
import postComposerStyles from "@/app/user/post_composer/page.module.css";
import profileStyles from "@/app/user/profile/page.module.css";
import publicInfoStyles from "@/app/user/public_info_settings/page.module.css";
import followerEntryStyles from "@/app/user/followers/entries/userEntry.module.css";
import postEntryStyles from "@/app/user/home/entries/postEntry.module.css";

import notificationEntryStyles from "@/app/user/notifications/entries/notificationEntry.module.css";
import commentEntryStyles from "@/app/user/post/entries/commentEntry.module.css";


const supportedComponents = {
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
};
