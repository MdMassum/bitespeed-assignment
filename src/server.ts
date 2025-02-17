import express, { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import { getAllContacts, identifyContact } from "./controllers/contactController";
import authRouter from './routes/authRoute'

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// routes -->
app.post('/identify', identifyContact)
app.get('/identify', getAllContacts)
app.use('/auth', authRouter) // authentication route 
app.get('/',(req:Request, res:Response)=>{
    res.json({
        "message":"server up and running"
    })
})

// server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// error handler -->
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {

    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
});