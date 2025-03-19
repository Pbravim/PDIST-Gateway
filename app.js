import express from 'express';
import axios from 'axios';
import cors from 'cors';
import sendReservationRequest from './messageria/messageriaProducer.js'

class App {
    constructor() {
        this.app = express();
        this.middlewares();
        this.routes();
    }

    middlewares() {
        this.app.use(cors())
        this.app.use(express.json()); 
        this.app.use(express.urlencoded({ extended: true })); 
    }

    async proxyRequest(req, res, targetBaseUrl) {
        try {
            const targetUrl = `${targetBaseUrl}${req.url}`;

            console.log(`Proxying request to: ${targetUrl}`);        
            console.log('Request Method:', req.method);
            console.log('Request Headers:', JSON.stringify(req.headers, null, 2));
            console.log('Request Body:', req.body ? JSON.stringify(req.body, null, 2) : 'No body');
    
            const axiosConfig = {
                method: req.method,
                url: targetUrl,
                headers: req.headers,
                data: JSON.stringify(req.body)
            };
    
            delete axiosConfig.headers["content-length"];
            
            const response = await axios(axiosConfig);
    
            console.log('Response Status:', response.status);
            console.log('Response Headers:', JSON.stringify(response.headers, null, 2));
            console.log('Response Body:', JSON.stringify(response.data, null, 2));
    
            res.status(response.status).json(response.data);
        } catch (error) {   
            if (error.isAxiosError) {
                console.error('Axios error details:', {
                    message: error.message,
                    status: error.response?.status,
                    headers: error.response?.headers,
                    data: error.response?.data
                });
            }
    
            res.status(error.response?.status || 500).json({
                message: 'Proxy error',
                details: error ? error.response?.data : error.message
            });
        }
    }

    async rentCar (req, res) {
        try {
            const { carId } = req.params;

            const reservationData = {
                carId,
                token: req.headers.authorization.split(" ")[1]
            }
            
            sendReservationRequest(reservationData)
            .then(() => {
                res.status(200).json({ message: "Reserva enviada com sucesso!" });
            })
            .catch((error) => {
                console.error("Erro ao enviar reserva:", error);
                res.status(500).json({ message: "Erro ao enviar reserva" });
            });
        } catch (error) {
            console.log(error)
            res.status(500).json({ message: "Erro ao enviar reserva" });
        }
    }

    routes() {
        this.app.use((req, res, next) => {
            console.log(req.path, req.method);
            next()
        })

        this.app.use("/rent-car/:carId", (req, res) => {
            this.rentCar(req, res)
        }) 

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
