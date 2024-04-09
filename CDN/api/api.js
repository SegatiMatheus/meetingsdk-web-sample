import { instance } from "./axios.js";

export class ApiRequests {

    static async getData() {
        const searchUser = await instance
            .get('/buscas/dados-zoom')
            .then(resp => {
                console.log(resp.data);
                return resp.data;
            })
            .catch(err => {
                console.log(err.response.data);
                return err.response.data
            })

        return searchUser
    }

}

ApiRequests.getData();