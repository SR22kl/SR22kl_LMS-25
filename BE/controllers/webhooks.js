import { Webhook } from "svix";
import User from "../models/userModel.js";
import Stripe from "stripe";
import Purchase from "../models/purchaseModel.js";
import Course from "../models/courseModel.js";

// Api Controller Function to Manage Clerk User With Database

export const clerkWebhooks = async (req, res) => {
  try {
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

    // Verify the webhook signature to ensure the request is from Clerk
    await whook.verify(JSON.stringify(req.body), {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    });

    const { data, type } = req.body;

    console.log(`Received Clerk webhook event: ${type}`);

    switch (type) {
      case "user.created": {
        const userData = {
          _id: data.id, // Clerk's user ID as MongoDB's _id
          email: data.email_addresses[0].email_address,
          // Construct full name, handling cases where first or last name might be missing
          name: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
          imageUrl: data.image_url, // Clerk uses image_url, not user.imageUrl
        };
        // Attempt to create the user in the database
        const newUser = await User.create(userData);
        console.log(`User created: ${newUser._id}`);
        res
          .status(201)
          .json({ success: true, message: `User ${newUser._id} created.` });
        break;
      }

      case "user.updated": {
        const userData = {
          email: data.email_addresses[0].email_address,
          name: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
          imageUrl: data.image_url, // Clerk uses image_url, not user.imageUrl
        };
        const updatedUser = await User.findByIdAndUpdate(data.id, userData, {
          new: true,
        });
        if (updatedUser) {
          console.log(`User updated: ${updatedUser._id}`);
          res.json({
            success: true,
            message: `User ${updatedUser._id} updated.`,
          });
        } else {
          console.warn(`User with ID ${data.id} not found for update.`);
          res.status(404).json({
            success: false,
            message: `User with ID ${data.id} not found.`,
          });
        }
        break;
      }

      case "user.deleted": {
        const deletedUser = await User.findByIdAndDelete(data.id);
        if (deletedUser) {
          // If a user document was actually found and deleted
          console.log(`User deleted: ${data.id}`);
          res.json({ success: true, message: `User ${data.id} deleted.` });
        } else {
          console.warn(
            `User with ID ${data.id} not found for deletion (possibly already deleted or never existed).`
          );
          res.status(200).json({
            success: true,
            message: `User with ID ${data.id} not found, but acknowledged deletion.`,
          });
        }
        break;
      }

      default:
        // Handle any other webhook types that you might want to log or ignore
        console.log(`Unhandled Clerk webhook type: ${type}`);
        res
          .status(200)
          .json({ success: true, message: `Unhandled webhook type: ${type}` });
        break;
    }
  } catch (error) {
    console.error(`Error processing Clerk webhook:`, error);
    res.status(500).json({
      success: false,
      message: "Internal server error processing webhook.",
    });
  }
};

const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
export const stripeWebhooks = async (request, response) => {
  const sig = request.headers["stripe-signature"];

  let event;

  try {
    event = Stripe.webhooks.constructEvent(
      request.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.log(`❌ Webhook Error: ${error.message}`);
    return response.status(400).send(`Webhook Error: ${error.message}`);
  }

  //Handle the event
  switch (event.type) {
    case "payment_intent.succeeded": {
      try {
        const paymentIntentSucceeded = event.data.object;
        const paymentIntentId = paymentIntentSucceeded.id;

        const sessionList = await stripeInstance.checkout.sessions.list({
          payment_intent: paymentIntentId,
        });

        if (!sessionList.data || sessionList.data.length === 0) {
          console.log(
            `❌ No session found for payment_intent: ${paymentIntentId}`
          );
          return response.status(404).send("Session not found.");
        }

        // --- Applied changes ---
        // Changed 'session.data[0].metadata' to 'sessionList.data[0].metadata'
        // Also added `|| {}` for robustness in case metadata is null/undefined
        const { purchaseId } = sessionList.data[0].metadata || {};

        if (!purchaseId) {
          console.log(
            `❌ purchaseId missing in metadata for session: ${sessionList.data[0].id}`
          );
          return response
            .status(400)
            .send("Purchase ID missing from metadata.");
        }

        const purchaseData = await Purchase.findById(purchaseId);
        if (!purchaseData) {
          console.log(`❌ Purchase not found for ID: ${purchaseId}`);
          return response.status(404).send("Purchase record not found.");
        }

        const userData = await User.findById(purchaseData.userId);
        if (!userData) {
          console.log(`❌ User not found for ID: ${purchaseData.userId}`);
          return response.status(404).send("User record not found.");
        }

        const courseData = await Course.findById(
          purchaseData.courseId.toString()
        );
        if (!courseData) {
          console.log(`❌ Course not found for ID: ${purchaseData.courseId}`);
          return response.status(404).send("Course record not found.");
        }

        // It's good practice to prevent duplicates if pushing objects/IDs directly
        // Assuming enrolledStudents holds user IDs (Mongoose ObjectIds)
        if (
          !courseData.enrolledStudents
            .map(String)
            .includes(String(userData._id))
        ) {
          courseData.enrolledStudents.push(userData._id);
          await courseData.save();
        }

        // Assuming enrolledCourses holds course IDs (Mongoose ObjectIds)
        if (
          !userData.enrolledCourses.map(String).includes(String(courseData._id))
        ) {
          userData.enrolledCourses.push(courseData._id);
          await userData.save();
        }

        purchaseData.status = "completed";
        await purchaseData.save();
      } catch (dbError) {
        console.error(
          `❌ Database operation error for payment_intent.succeeded: ${dbError.message}`
        );
        // Return 200 to Stripe, but indicate internal server error
        return response.status(200).json({
          received: true,
          error: `Internal Server Error: ${dbError.message}`,
        });
      }
      break;
    }
    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;

      const sessionList = await stripeInstance.checkout.sessions.list({
        payment_intent: paymentIntentId,
      });

      // --- FIX APPLIED HERE ---
      // Changed 'session.data[0].metadata' to 'sessionList.data[0].metadata'
      // Added check for empty sessionList.data before accessing [0]
      if (!sessionList.data || sessionList.data.length === 0) {
        console.log(
          `❌ No session found for failed payment_intent: ${paymentIntentId}. Cannot update purchase status.`
        );
        return response
          .status(404)
          .send("Session not found for failed payment intent.");
      }

      const { purchaseId } = sessionList.data[0].metadata || {};

      if (!purchaseId) {
        console.log(
          `❌ purchaseId missing in metadata for failed session: ${sessionList.data[0].id}. Cannot update purchase status.`
        );
        return response
          .status(400)
          .send("Purchase ID missing from metadata for failed payment.");
      }

      const purchaseData = await Purchase.findById(purchaseId);
      if (!purchaseData) {
        console.log(
          `❌ Purchase not found for ID: ${purchaseId} for failed payment.`
        );
        return response
          .status(404)
          .send("Purchase record not found for failed payment.");
      }

      purchaseData.status = "failed";
      await purchaseData.save();

      break;
    }
    //handle other event types
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
  response.json({ received: true });
};
