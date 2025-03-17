export async function transformPostObjArr(postObjArr) {
    let posts = [];
    for (let postObj of postObjArr) {
        let post = {
            title: postObj.post.title,
            text: postObj.post.text,
            author: postObj.userId,
            displayName: "Display Name",
            createdAt: postObj.post.createdAt,
            tags: postObj.post.tags,
        };

        // TODO: verify each post with signature

        posts.push(post);
    }

    console.log("> Posts:", postObjArr, " -> ", posts);
    return posts;
}