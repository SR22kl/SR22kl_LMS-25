import { clerkClient } from "@clerk/express";

//Middleware (Protect Educator Route)
export const protectEducator = async (req, res, next) => {
  try {
    const { userId } = req.auth();

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    }

    const response = await clerkClient.users.getUser(userId);

    if (response.publicMetadata.role !== "educator") {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized Access" });
    }

    next();
  } catch (error) {
    // console.error("Error in protectEducator middleware:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
