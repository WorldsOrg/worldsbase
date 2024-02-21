import axios from 'axios'
const baseURL = process.env.NODE_ENV === "production" ? process.env.NEXT_PUBLIC_BASE_URL : "http://localhost:3002";

const apiClient = axios.create({
    baseURL: `${baseURL}/api/v1`,
    headers: {
        'Content-type': 'application/json'
    }
})

export default apiClient
