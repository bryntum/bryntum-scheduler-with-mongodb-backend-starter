import mongoose from "mongoose";

const { Schema, model } = mongoose;

const opts = {
  toJSON: {
    virtuals: true,
    transform: function (_, ret) {
      delete ret._id;
      delete ret.__v;
    },
  },
};

export const assignmentSchema = new Schema(
  {
    eventId: {
      type: Schema.Types.ObjectId, // eventId refers to an _id in the events collection
      required: true,
      ref: "Event",
    },
    resourceId: {
      type: Schema.Types.ObjectId, // resourceId refers to an _id in the resources collection
      required: true,
      ref: "Resource",
    },
  },
  opts
);

const Assignment = model("Assignment", assignmentSchema);

export default Assignment;
