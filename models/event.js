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

export const eventSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    readOnly: {
      type: Boolean,
      default: false,
    },
    resourceId: {
      type: Schema.Types.ObjectId, // resourceId refers to an _id in the resources collection
      default: null,
      ref: "Resource",
    },
    timeZone: {
      type: String,
      default: null,
    },
    draggable: {
      type: Boolean,
      default: true,
    },
    resizable: {
      type: String,
      default: null,
    },
    children: {
      type: String,
      default: null,
    },
    allDay: {
      type: Boolean,
      default: false,
    },
    duration: {
      type: Number,
      default: null,
    },
    durationUnit: {
      type: String,
      default: "day",
    },
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },
    exceptionDates: {
      type: Schema.Types.Mixed, // Can be either a string (either a single date or multiple dates separated by comma) or an array of strings
      default: null,
    },
    recurrenceRule: {
      type: String,
      default: null,
    },
    cls: {
      type: String,
      default: null,
    },
    eventColor: {
      type: String,
      default: null,
    },
    eventStyle: {
      type: String,
      default: null,
    },
    iconCls: {
      type: String,
      default: null,
    },
    style: {
      type: String,
      default: null,
    },
  },
  opts
);

const Event = model("Event", eventSchema);

export default Event;
