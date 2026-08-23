import mongoose,{Schema,Document} from "mongoose";




export interface ITrek extends Document{
    name:string;
    region:string
    difficulty:"Easy" | "Moderate" | "Hard" | "Strenuous";
    duration:number
    price:number
    advanceAmount:number
    maxAltitude:number
    description:string
    images:string
    createdAt:Date
    updatedAt:Date

}

const trekSchema = new Schema<ITrek>(
    {
        name:{
            type:String,
            required:true,
            trim:true,
        },
        region:{
            type:String,
            required:true,
        },
        difficulty:{
            type:String,
            enum:["Easy", "Moderate", "Hard", "Strenuous"],
            required:true,
        },
        duration:{
            type:Number,
            required:true
        },
            price: {
      type: Number,
      required: true,
    },
    advanceAmount: {
      type: Number,
      required: true,
    },
    maxAltitude: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    images:[String],
      
    

    },
    {timestamps:true}
)

const Trek = mongoose.model<ITrek>("Trek",trekSchema)

export default Trek;