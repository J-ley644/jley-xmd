const store = new Map();


export function setDeployment(id, data){

    const current =
        store.get(id) || {};


    store.set(id, {
        ...current,
        ...data
    });

}



export function getDeployment(id){

    return store.get(id);

}



export function removeDeployment(id){

    store.delete(id);

}