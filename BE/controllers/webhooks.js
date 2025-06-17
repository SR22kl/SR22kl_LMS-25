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
export const stripeWebhooks1 = async (request, response) => {
  const sig = request.headers["stripe-signature"];

  let event;

  try {
    event = Stripe.webhooks.constructEvent(
      request.body,
      sig,
      process.env.STRIPE_WEBHOOD_SECRET
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

        const { purchaseId } = session.data[0].metadata;

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

        courseData.enrolledStudents.push(userData);
        await courseData.save();

        userData.enrolledCourses.push(courseData._id);
        await userData.save();

        purchaseData.status = "completed";
        await purchaseData.save();
      } catch (dbError) {
        console.error(
          `❌ Database operation error for payment_intent.succeeded: ${dbError.message}`
        );
        return response
          .status(500)
          .send(`Internal Server Error: ${dbError.message}`);
      }
      break;
    }
    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;
      const session = await stripeInstance.checkout.sessions.list({
        payment_intent: paymentIntentId,
      });

      const { purchaseId } = session.data[0].metadata;
      const purchaseData = await Purchase.findById(purchaseId);
      purchaseData.status = "failed";
      await purchaseData.save();

      break;
    }
    //handle other event types
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
  //Return response to acknowledge receipt of the event
  response.json({ received: true });
};

export const stripeWebhooks = async (request, response) => {
  // Extract the Stripe-Signature header from the request.
  const sig = request.headers["stripe-signature"];
  // Retrieve the webhook signing secret from environment variables.
  // FIX: Corrected environment variable name from WEBHOOD to WEBHOOK.
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event; // This variable will hold the parsed Stripe Event object.

  // --- Step 1: Verify Webhook Signature ---
  // As per Stripe docs, this is critical to ensure the webhook is legitimate.
  try {
    // `stripeInstance.webhooks.constructEvent` (or `Stripe.webhooks.constructEvent` which also works
    // as it's a static method) verifies the signature and parses the raw body into an event object.
    event = stripeInstance.webhooks.constructEvent(
      // Using stripeInstance for consistency
      request.body, // This MUST be the raw request body (a Buffer)
      sig, // The signature header
      webhookSecret // Your webhook signing secret
    );
    console.log(
      `✅ Webhook signature verified for event ID: ${event.id}, Type: ${event.type}`
    );
  } catch (error) {
    // If signature verification fails, log the error and send a 400 Bad Request.
    // Stripe will not retry events that result in a 4xx error.
    console.error(`❌ Webhook signature verification failed: ${error.message}`);
    return response.status(400).send(`Webhook Error: ${error.message}`);
  }

  // --- Step 2: Handle Specific Event Types ---
  // Use a switch statement to process different types of Stripe events.
  switch (event.type) {
    case "payment_intent.succeeded": {
      // Event: A PaymentIntent has successfully completed payment.
      const paymentIntent = event.data.object; // The PaymentIntent object.
      console.log(`💰 PaymentIntent succeeded: ${paymentIntent.id}`);

      try {
        // Fetch the Checkout Session associated with this PaymentIntent to retrieve custom metadata.
        // Using list and filtering by payment_intent as sometimes the checkout.session.completed
        // event might not arrive first, or for robustness.
        const sessionList = await stripeInstance.checkout.sessions.list({
          payment_intent: paymentIntent.id,
          limit: 1, // Limit to 1 as we expect only one session per PaymentIntent for this flow.
        });

        // Check if a session was found.
        if (!sessionList.data || sessionList.data.length === 0) {
          console.warn(
            `⚠️ No Checkout Session found for PaymentIntent: ${paymentIntent.id}. Unable to complete purchase.`
          );
          // Acknowledge the event with 200, but log the warning. Stripe will not retry this.
          return response.status(200).json({
            received: true,
            message: "No session found for PaymentIntent. Logging warning.",
          });
        }

        // FIX: Correctly access the session variable.
        const session = sessionList.data[0];
        // Extract the purchaseId from the Checkout Session's metadata.
        const { purchaseId } = session.metadata;

        // Validate that purchaseId exists.
        if (!purchaseId) {
          console.error(
            `❌ Missing purchaseId in metadata for successful session: ${session.id}.`
          );
          // Return a 400 as this is a data issue on our side that needs correction.
          return response
            .status(400)
            .send("Webhook Error: purchaseId missing from session metadata.");
        }

        // --- Database Operations for Successful Payment ---
        const purchaseData = await Purchase.findById(purchaseId);

        // Ensure the purchase record exists.
        if (!purchaseData) {
          console.error(
            `❌ Purchase record not found for ID: ${purchaseId}. Cannot update status.`
          );
          // Return 404 as the resource is not found. Stripe will not retry a 404.
          return response
            .status(404)
            .send("Webhook Error: Purchase record not found in database.");
        }

        // Idempotency check: If the purchase is already marked as completed, skip further processing.
        // FIX: Added idempotency check.
        if (purchaseData.status === "completed") {
          console.log(
            `ℹ️ Purchase ${purchaseId} is already marked as 'completed'. Skipping duplicate processing.`
          );
          return response.status(200).json({ received: true });
        }

        const userData = await User.findById(purchaseData.userId);
        if (!userData) {
          console.error(
            `❌ User record not found for ID: ${purchaseData.userId} associated with purchase ${purchaseId}.`
          );
          return response
            .status(404)
            .send("Webhook Error: User record not found.");
        }

        // FIX: Removed .toString() if courseId is already a Mongoose ObjectId.
        const courseData = await Course.findById(purchaseData.courseId);
        if (!courseData) {
          console.error(
            `❌ Course record not found for ID: ${purchaseData.courseId} associated with purchase ${purchaseId}.`
          );
          return response
            .status(404)
            .send("Webhook Error: Course record not found.");
        }

        // Add user to the course's enrolledStudents (if not already present for idempotency).
        // FIX: Ensure you're pushing the user's _id, not the entire user object, for Mongoose references.
        if (!courseData.enrolledStudents.includes(userData._id)) {
          courseData.enrolledStudents.push(userData._id);
          await courseData.save();
          console.log(
            `✅ User ${userData._id} successfully enrolled in course ${courseData._id}.`
          );
        } else {
          console.log(
            `ℹ️ User ${userData._id} already enrolled in course ${courseData._id}.`
          );
        }

        // Add course to the user's enrolledCourses (if not already present for idempotency).
        // FIX: Ensure you're pushing the course's _id.
        if (!userData.enrolledCourses.includes(courseData._id)) {
          userData.enrolledCourses.push(courseData._id);
          await userData.save();
          console.log(
            `✅ Course ${courseData._id} added to user ${userData._id}'s enrolled courses.`
          );
        } else {
          console.log(
            `ℹ️ Course ${courseData._id} already in user ${userData._id}'s enrolled courses.`
          );
        }

        // Update the purchase status to 'completed'.
        purchaseData.status = "completed";
        await purchaseData.save();
        console.log(`✅ Purchase ${purchaseId} status updated to 'completed'.`);
      } catch (dbError) {
        // Catch any errors that occur during database operations for this event type.
        console.error(
          `❌ Database operation failed for payment_intent.succeeded (Event ID: ${event.id}):`,
          dbError
        );
        // Return a 500 status to tell Stripe to retry this webhook event.
        return response
          .status(500)
          .send(
            `Internal Server Error during payment_intent.succeeded: ${dbError.message}`
          );
      }
      break; // End of 'payment_intent.succeeded' case
    }

    case "payment_intent.payment_failed": {
      // Event: A PaymentIntent has failed payment.
      const paymentIntent = event.data.object; // The PaymentIntent object.
      console.log(`💸 PaymentIntent failed: ${paymentIntent.id}`);

      // FIX: Added try...catch block for database operations in payment_intent.payment_failed.
      try {
        const sessionList = await stripeInstance.checkout.sessions.list({
          payment_intent: paymentIntent.id,
          limit: 1,
        });

        if (!sessionList.data || sessionList.data.length === 0) {
          console.warn(
            `⚠️ No Checkout Session found for failed PaymentIntent: ${paymentIntent.id}.`
          );
          return response.status(200).json({
            received: true,
            message: "No session found for failed PaymentIntent.",
          });
        }

        // FIX: Correctly access the session variable.
        const session = sessionList.data[0];
        const { purchaseId } = session.metadata;

        if (!purchaseId) {
          console.error(
            `❌ Missing purchaseId in metadata for failed session: ${session.id}.`
          );
          return response
            .status(400)
            .send(
              "Webhook Error: purchaseId missing from metadata for failed payment."
            );
        }

        const purchaseData = await Purchase.findById(purchaseId);
        if (!purchaseData) {
          console.error(
            `❌ Purchase record not found for failed payment, ID: ${purchaseId}.`
          );
          return response
            .status(404)
            .send(
              "Webhook Error: Purchase record not found for failed payment."
            );
        }

        // FIX: Added idempotency check.
        if (purchaseData.status === "failed") {
          console.log(
            `ℹ️ Purchase ${purchaseId} is already marked as 'failed'. Skipping duplicate processing.`
          );
          return response.status(200).json({ received: true });
        }

        // Update the purchase status to 'failed'.
        purchaseData.status = "failed";
        await purchaseData.save();
        console.log(`✅ Purchase ${purchaseId} status updated to 'failed'.`);
      } catch (dbError) {
        // Catch any errors that occur during database operations for this event type.
        console.error(
          `❌ Database operation failed for payment_intent.payment_failed (Event ID: ${event.id}):`,
          dbError
        );
        // Return a 500 status to tell Stripe to retry this webhook event.
        return response
          .status(500)
          .send(
            `Internal Server Error during payment_intent.payment_failed: ${dbError.message}`
          );
      }
      break; // End of 'payment_intent.payment_failed' case
    }

    // --- Step 3: Handle Other Event Types (Optional) ---
    // You can add more cases here for other event types you're interested in.
    default:
      // For any unhandled event types, log a warning.
      // We still send a 200 OK here, as the webhook was successfully received and verified,
      // but we chose not to process this specific event type.
      console.warn(
        `⚠️ Unhandled Stripe event type received: ${event.type}. Event ID: ${event.id}`
      );
  }

  response.status(200).json({ received: true });
};
