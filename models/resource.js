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

export const resourceSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    eventColor: {
      type: String,
      default: null,
    },
    readOnly: {
      type: Boolean,
      default: false,
    },
  },
  opts
);

const Resource = model("Resource", resourceSchema);

export default Resource;
