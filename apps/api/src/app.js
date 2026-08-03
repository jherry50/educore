import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";


const app = express();


app.use(cors());

app.use(helmet());

app.use(morgan("dev"));

app.use(express.json());


app.get("/",(req,res)=>{

res.json({
message:"EduCore SMS API Running"
});

});


export default app;