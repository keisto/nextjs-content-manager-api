const express = require("express")
const app = express()
const PORT = process.env.PORT || 3001

const fs = require("fs")
const path = require("path")
const pathToFile = path.resolve("./data.json")
const cors = require("cors")

app.use(
  cors({
    origin: "http://localhost:3000",
    optionsSuccessStatus: 200,
  })
)

app.use(express.json())

const getResources = () => JSON.parse(fs.readFileSync(pathToFile))

app.get("/", (req, res) => {
  res.send("hello")
})

app.get("/api/resources/active", (req, res) => {
  const resources = getResources();
  const resource = resources.find((resource) => resource.status === "active");

  if (!resource) {
    res.status(200).send("No active resource.")
  }
  res.send(resource);
})

app.get("/api/resources/:id", (req, res) => {
  const resources = getResources();
  const {id} = req.params;
  // console.log(resources.find((resource) => resource.id == id))
  res.send(resources.find((resource) => resource.id === id))
})

app.patch("/api/resources/:id", (req, res) => {
  const resources = getResources();
  const {id} = req.params;
  const index = resources.findIndex((resource) => resource.id === id)
  const activeResource = resources.find((resource) => resource.status === "active");
  const updatedValues = { updatedAt: new Date() }

  if (req.body.status === "active") {
    if (activeResource) {
      return res.status(422).send("You already have an active resource.")
    }

    updatedValues.status = "active";
    updatedValues.activationTime = new Date();
  }

  if (resources[index].status === "complete") {
    return res.status(422).send("Resource already completed.")
  }

  resources[index] = {...req.body, ...updatedValues}

  fs.writeFile(pathToFile, JSON.stringify(resources, null, 2), (error) => {
    if (error) {
      return res.status(422).send("Cannont store data in the file")
    }

    return res.send("Data has been saved!")
  })
})

app.get("/api/resources", (req, res) => {
  const resources = getResources();
  res.send(resources.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)))
})

app.post("/api/resources", (req, res) => {
  const resources = getResources()
  const resource = req.body
  const dateTime = new Date()

  // Initial resource defaults
  resource.createdAt = dateTime
  resource.updatedAt = dateTime
  resource.status = "inactive"
  resource.id = Date.now().toString()

  resources.push(resource);

  fs.writeFile(pathToFile, JSON.stringify(resources, null, 2), (error) => {
    if (error) {
      return res.status(422).send("Cannont store data in the file")
    }

    return res.send("Data has been saved!")
  })

  // res.send("Data has been recieved");
})

app.listen(PORT, () => {
  console.log(`Server is listening on port: ${PORT}`)
})
