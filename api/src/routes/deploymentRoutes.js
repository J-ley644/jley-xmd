import { Router } from "express";
import {
    createDeployment,
    getDeployments,
    getDeployment,
    pairDeployment,
    startDeployment,
    stopDeployment,
    deleteDeployment
} from "../controllers/deploymentController.js";

import auth from "../middleware/auth.js";
import * as botEngineService from "../services/botEngineService.js";

const router = Router();

router.get(
    "/:id",
    getDeployment
);

router.get("/", auth, getDeployments);

router.post("/create", auth, createDeployment);

router.post("/:id/pair", auth, pairDeployment);

router.post("/:id/start", auth, startDeployment);


router.post("/:id/stop", auth, stopDeployment);
router.delete(
    "/:id",
    auth,
    deleteDeployment
);

router.post(
"/:id/pairing-code",
async(req,res)=>{

try{

const code =
await botEngineService.createPairingCode(
req.params.id,
req.body.phoneNumber
);


res.json({

success:true,
code

});


}catch(error){

res.status(500).json({

error:error.message

});

}

});

export default router;