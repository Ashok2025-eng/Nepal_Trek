import express,{Application,Request,Response}from"express";


const app =express();

app.use(express.json())

app.get("/api/health",(req:Request,Res:Response)=>{
Res.status(200).json({
success:true,
message:"Nepal Trek API is running"
})
})

export default app;