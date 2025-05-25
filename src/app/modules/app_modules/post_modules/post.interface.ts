import { Types } from "mongoose";
import auth from "../../../middlewares/auth";

{
    _id: Types.ObjectId; // Unique identifier for the complain report
    authorId: Types.ObjectId of User; // Reference to the user who created the post
    content : string; // Content of the post by rich text editor`
}