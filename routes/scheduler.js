import express from "express";
import db from "../db/conn.js";
import { randomUUID } from "crypto";

const router = express.Router();

router.get("/load", async (req, res) => {
  try {
    const collection = db.collection("data");
    const results = await collection.find().toArray();
    res
      .send({
        ...results[0],
      })
      .status(200);
  } catch (error) {
    console.error({ error });
    res.send({
      success: false,
      message: "There was an error loading the resources and events data.",
    });
  }
});

router.post("/sync", async (req, res) => {
  const { requestId, resources, events, assignments, dependencies } = req.body;
  const collection = db.collection("data");

  let eventMapping = {};

  try {
    const response = { requestId, success: true };

    if (resources) {
      const rows = await applyCollectionChanges(
        "resources",
        resources,
        collection
      );
      // if new data to update client
      if (rows) {
        response.resources = { rows };
      }
    }

    if (events) {
      const rows = await applyCollectionChanges("events", events, collection);
      if (rows) {
        if (events?.added) {
          rows.forEach((row) => {
            eventMapping[row.$PhantomId] = row.id;
          });
        }
        response.events = { rows };
      }
    }

    if (assignments) {
      if (events && events?.added) {
        assignments.added.forEach((assignment) => {
          assignment.eventId = eventMapping[assignment.eventId];
        });
      }
      const rows = await applyCollectionChanges(
        "assignments",
        assignments,
        collection
      );
      if (rows) {
        response.assignments = { rows };
      }
    }

    if (dependencies) {
      const rows = await applyCollectionChanges(
        "dependencies",
        dependencies,
        collection
      );
      if (rows) {
        response.dependencies = { rows };
      }
    }
    res.send(response);
  } catch (error) {
    console.error({ error });
    res.send({
      requestId,
      success: false,
      message: "There was an error syncing the data.",
    });
  }
});

async function applyCollectionChanges(store, changes, collection) {
  let rows;
  if (changes.added) {
    rows = await createOperation(changes.added, store, collection);
  }
  if (changes.removed) {
    await deleteOperation(changes.removed, store, collection);
  }
  if (changes.updated) {
    await updateOperation(changes.updated, store, collection);
  }
  // if got some new data to update client
  return rows;
}

function createOperation(added, store, collection) {
  return Promise.all(
    added.map(async (record) => {
      const { $PhantomId, ...data } = record;

      const id = randomUUID();
      data.id = id;

      // Insert record into the store.rows array
      if (store === "resources") {
        await collection.updateOne({}, { $push: { "resources.rows": data } });
      }
      if (store === "events") {
        await collection.updateOne({}, { $push: { "events.rows": data } });
      }
      if (store === "assignments") {
        await collection.updateOne({}, { $push: { "assignments.rows": data } });
      }
      if (store === "dependencies") {
        await collection.updateOne(
          {},
          { $push: { "dependencies.rows": data } }
        );
      }
      // report to the client that we changed the record identifier
      return { $PhantomId, id };
    })
  );
}

function deleteOperation(deleted, store, collection) {
  return Promise.all(
    deleted.map(async ({ id }) => {
      if (store === "resources") {
        // MongoDB query to pull (remove) the item from the array
        await collection.updateOne(
          {},
          { $pull: { "resources.rows": { id: id } } }
        );
      }
      if (store === "events") {
        await collection.updateOne(
          {},
          { $pull: { "events.rows": { id: id } } }
        );
      }
      if (store === "assignments") {
        await collection.updateOne(
          {},
          { $pull: { "assignments.rows": { id: id } } }
        );
      }
      if (store === "dependencies") {
        await collection.updateOne(
          {},
          { $pull: { "dependencies.rows": { id: id } } }
        );
      }
    })
  );
}

function updateOperation(updated, store, collection) {
  return Promise.all(
    updated.map(async ({ id, ...data }) => {
      const updateData = {};
      for (const [key, value] of Object.entries(data)) {
        updateData[`${store}.rows.$[elem].${key}`] = value;
      }

      await collection.updateOne(
        {},
        { $set: updateData },
        { arrayFilters: [{ "elem.id": id }] }
      );
    })
  );
}

export default router;
