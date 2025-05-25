import { Types } from "mongoose";

{
    _id: Types.ObjectId; // Unique identifier for the complain report   
    post: Types.ObjectId of post; // Reference to the post being reported
    reportedBy : Types.ObjectId of user; // Reference to the user who reported the post
    status: `UNDER_REVIEW` | `RESOLVE` ; // Status of the report

}