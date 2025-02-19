import express from 'express';
import axios from 'axios';


class App {
    constructor() {
        this.app = express();
        this.middlewares();
        this.routes();
    }

    middlewares() {
        this.app.use(express.json()); 
        this.app.use(express.urlencoded({ extended: true })); 
    }

    async proxyRequest(req, res, targetBaseUrl) {
        try {
            const targetUrl = `${targetBaseUrl}${req.url}`;
            console.log(`Proxying request to ${targetUrl}`);

            const axiosConfig = {
                method: req.method,
                url: targetUrl,
                headers: req.headers,
                data: JSON.stringify(req.body) 
            };

            delete axiosConfig.headers["content-length"];
            const response = await axios(axiosConfig);
            
            
            res.status(response.status).json(response.data);
        } catch (error) {
            console.error('Proxy error:', error.message);
            res.status(error.response?.status || 500).json({
                message: 'Proxy error',
                details: error.message
            });
        }
    }

    routes() {
        this.app.use('/api1', (req, res) => this.proxyRequest(req, res, 'http://localhost:3054'));
        this.app.use('/api2', (req, res) => this.proxyRequest(req, res, 'http://localhost:3053'));
    }


    start(port) {
        this.app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
    }
}

export default new App();
