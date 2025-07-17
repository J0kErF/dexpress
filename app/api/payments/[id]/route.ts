// app/api/payments/[id]/route.ts

// Import necessary modules for database connection, Mongoose model, and Next.js server responses.
import { connectToDB } from "@/lib/mongodb"; // Utility to connect to MongoDB
import Payment from "@/models/Payment"; // Mongoose Payment model
import { NextResponse } from "next/server"; // Next.js API response utility

/**
 * GET handler for fetching a single payment by ID.
 * This function handles HTTP GET requests to /api/payments/[id].
 *
 * @param _req The incoming Next.js Request object. It's prefixed with '_' to indicate it's not directly used in this function's logic, but is part of the required signature.
 * @param context An object containing dynamic route parameters.
 * @param context.params An object holding the dynamic segments of the URL.
 * @param context.params.id The 'id' parameter extracted from the URL (e.g., /api/payments/123 -> id = "123").
 * @returns A NextResponse object containing the payment data or an error message.
 */
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Establish a connection to the MongoDB database.
    // This function typically handles connection caching to prevent multiple connections.
    await connectToDB();

    // Extract the payment ID from the dynamic route parameters.
    const { id } = params;

    // Find the payment document by its ID in the database.
    // .lean() is used to return plain JavaScript objects instead of Mongoose documents,
    // which can improve performance for read operations.
    const payment = await Payment.findById(id).lean();

    // If no payment is found with the given ID, return a 404 Not Found response.
    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // If the payment is found, return it as a JSON response with a 200 OK status.
    return NextResponse.json(payment);
  } catch (error: any) {
    // Catch any errors that occur during the process (e.g., database connection issues, invalid ID format).
    console.error("Error fetching payment:", error);
    // Return a 500 Internal Server Error response with the error message.
    return NextResponse.json(
      { error: "Failed to fetch payment", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT handler for updating a payment document by ID.
 * This function handles HTTP PUT requests to /api/payments/[id] to replace an entire document.
 *
 * @param req The incoming Next.js Request object, containing the request body.
 * @param context An object containing dynamic route parameters.
 * @param context.params An object holding the dynamic segments of the URL.
 * @param context.params.id The 'id' parameter extracted from the URL.
 * @returns A NextResponse object containing the updated payment data or an error message.
 */
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Establish a connection to the MongoDB database.
    await connectToDB();

    // Extract the payment ID from the dynamic route parameters.
    const { id } = params;
    // Parse the JSON body from the request. This body will contain the new data for the payment.
    const body = await req.json();

    // Find the payment by ID and update it with the provided body.
    // { new: true } option returns the modified document rather than the original.
    // .lean() is not typically used with update operations if you need to further
    // interact with the Mongoose document after update (e.g., save, validate).
    // For simple return, it's fine.
    const updated = await Payment.findByIdAndUpdate(id, body, { new: true }).lean();

    // If no payment is found with the given ID, return a 404 Not Found response.
    if (!updated) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // Return the updated payment as a JSON response.
    return NextResponse.json(updated);
  } catch (error: any) {
    // Catch any errors during the update process.
    console.error("Error updating payment:", error);
    // Return a 500 Internal Server Error response.
    return NextResponse.json(
      { error: "Failed to update payment", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE handler for deleting a payment by ID.
 * This function handles HTTP DELETE requests to /api/payments/[id].
 *
 * @param _req The incoming Next.js Request object (not used in this delete operation).
 * @param context An object containing dynamic route parameters.
 * @param context.params An object holding the dynamic segments of the URL.
 * @param context.params.id The 'id' parameter extracted from the URL.
 * @returns A NextResponse object indicating success or an error message.
 */
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Establish a connection to the MongoDB database.
    await connectToDB();

    // Extract the payment ID from the dynamic route parameters.
    const { id } = params;

    // Find and delete the payment document by its ID.
    const deleted = await Payment.findByIdAndDelete(id).lean();

    // If no payment is found (meaning it wasn't deleted), return a 404 Not Found response.
    if (!deleted) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // Return a success message if the payment was deleted.
    return NextResponse.json({ success: true, message: "Payment deleted successfully" });
  } catch (error: any) {
    // Catch any errors during the delete process.
    console.error("Error deleting payment:", error);
    // Return a 500 Internal Server Error response.
    return NextResponse.json(
      { error: "Failed to delete payment", details: error.message },
      { status: 500 }
    );
  }
}

// Ensure that this API route is dynamically rendered on each request.
// This is important for serverless functions that might need fresh data or
// to handle authentication/authorization on a per-request basis.
export const dynamic = "force-dynamic";