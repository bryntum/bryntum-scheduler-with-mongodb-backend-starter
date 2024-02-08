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

export const dependencySchema = new Schema(
  {
    from: {
      type: Schema.Types.ObjectId, // 'from' refers to an _id in the events collection
      default: null,
      ref: "Event",
    },
    to: {
      type: Schema.Types.ObjectId, // to' refers to an _id in the events collection
      default: null,
      ref: "Event",
    },
    fromSide: {
      type: String,
      default: "right",
      enum: ["top", "left", "bottom", "right", "start", "end"],
    },
    toSide: {
      type: String,
      default: "left",
      enum: ["top", "left", "bottom", "right", "start", "end"],
    },
    cls: {
      type: String,
      default: null,
    },
    lag: {
      type: Number,
      default: 0,
    },
    lagUnit: {
      type: String,
      default: "day",
    },
  },
  opts
);

const Dependency = model("Dependency", dependencySchema);

export default Dependency;
