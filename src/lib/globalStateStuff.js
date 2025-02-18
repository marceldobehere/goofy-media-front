let initReadyRes;
export const initReady = new Promise((res, rej) => {
    initReadyRes = res;
});

async function initGlobalState() {


    initReadyRes();
}