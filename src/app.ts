import express,{Application,Request,Response}from"express";
import trekRoutes from "./routes/trekRoutes"
import { errorHandler } from "./middlewares/errorHandler";

const app =express();

app.use(express.json())


//* API HEALTH CHECK
app.get("/api/health",(req:Request,Res:Response)=>{
Res.status(200).json({
success:true,
message:"Nepal Trek API is running"
})
})


app.use("/api/treks",trekRoutes)

//* error handler
app.use(errorHandler)





export default app;