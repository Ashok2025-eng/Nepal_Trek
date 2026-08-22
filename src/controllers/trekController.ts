import Trek from "../models/trek";
import { Request, Response } from "express";


// @desc Create a new trek
//@route Post /api/treks

export const createTrek =async(req:Request,res:Response)=>{
    try{

const trek = await Trek.create(req.body)

res.status(201).json({
    success:true,
    data:trek,
})


    }catch(error){
        res.status(500).json({
            success:false,
            message:"Failed to fetch treks",
            error: error instanceof Error? error. message:error,
        })
    }

}

// @desc    Get all treks
// @route   GET /api/treks
export const getTreks = async (req: Request, res: Response) => {
  try {
    const treks = await Trek.find();

    res.status(200).json({
      success: true,
      count: treks.length,
      data: treks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch treks",
      error: error instanceof Error ? error.message : error,
    });
  }
};

// @desc    Get a single trek by ID
// @route   GET /api/treks/:id
export const getTrekById = async (req: Request, res: Response) => {
  try {
    const trek = await Trek.findById(req.params.id);

    if (!trek) {
      return res.status(404).json({
        success: false,
        message: "Trek not found",
      });
    }

    res.status(200).json({
      success: true,
      data: trek,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch trek",
      error: error instanceof Error ? error.message : error,
    });
  }
};