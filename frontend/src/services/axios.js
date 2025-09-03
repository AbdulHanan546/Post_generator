import axios from 'axios';

const baseURL = process.env.REACT_APP_API_URL || "https://post-generator-2p7o.onrender.com";
const instance = axios.create({ baseURL, withCredentials: true });
export default instance;


