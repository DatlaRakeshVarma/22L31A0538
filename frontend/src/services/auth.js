import axios from 'axios';

const AUTH_API_URL = 'http://28.244.56.144/evaluation-service/auth';

const credentials = {
    "email": "ramkrishna@abc.edu",
    "name": "ram krishna",
    "rollNo": "aa1bb",
    "accessCode": "xgaNC",
    "clientID": "d9cdb899-6a27-44a5-8d59-8b1befa816da",
    "clientSecret": "tvJaaaRBSaXcRXeM"
};

let authToken = null;

export const getAuthToken = async () => {
    if (authToken) {
        return authToken;
    }

    try {
        const response = await axios.post(AUTH_API_URL, credentials);
        authToken = response.data.token_type + ' ' + response.data.access_token;
        return authToken;
    } catch (error) {
        console.error('Failed to get auth token:', error);
        throw error;
    }
};
