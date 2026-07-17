import { Router } from "express";
import {
    createDeployment,
    getDeployments
} from "../controllers/deploymentController.js";


const router = Router();


router.get("/", getDeployments);

router.post("/create", createDeployment);


export default router;