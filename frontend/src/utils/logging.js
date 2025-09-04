import axios from 'axios';
import { getAuthToken } from './auth';

const LOG_API_URL = 'http://28.244.56.144/evaluation-service/log';

export const Log = async (stack, level, packageName, message) => {
    try {
        const token = await getAuthToken();
        await axios.post(LOG_API_URL, {
            stack,
            level,
            package: packageName,
            message
        }, {
            headers: {
                'Authorization': token
            }
        });
    } catch (error) {
        console.error('Failed to send log:', error);
    }
};
