import axios from 'axios';

export const api = axios.create({
	baseURL: 'https://www.alphavantage.co'
})

api.interceptors.request.use
(
    async config => 
    {
        config.headers['Content-Type'] = 'application/json';
		config.headers['Accept'] = 'application/json';
		return config;
	},
    error => 
    {
		Promise.reject(error)
	}
);

api.interceptors.response.use
(
    response => 
    {
        return response;
    }, 
    error => 
    {        
        Promise.reject(error);
    }
);
