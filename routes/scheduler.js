import express from "express";

const router = express.Router();

router.get("/load", async (req, res) => {
  res
    .send({
      success: true,
    })
    .status(200);
});

export default router;
