import fs from "fs"
import fetch from "node-fetch"
import FormData from "form-data"
import { config } from "dotenv"

config()

const SUBGRAPH_URL = "https://subgraph.decentraland.org/collections-matic-mainnet"
const COLLECTION_IMPLEMENTATION_ADDRESS = "0x006080C6061C4aF79b39Da0842a3a22A7b3f185e"
const CREATED_AT_GTE = process.env.CREATED_AT_GTE!
const POLYGONSCAN_API_KEY = process.env.POLYGONSCAN_API_KEY

export type Collection = { id: string; createdAt: string }
export type StoredCollection = Collection & { failedWith?: string }

export default async function verifyCollections(onlyFailed: boolean, dataPath: string) {
  if (!fs.existsSync(dataPath)) {
    fs.writeFileSync(dataPath, JSON.stringify([], null, 2))
  }

  const storedCollections: StoredCollection[] = JSON.parse(fs.readFileSync(dataPath, "utf-8"))

  let collections: Collection[]

  if (onlyFailed) {
    collections = storedCollections.filter((c) => !!c.failedWith)
  } else {
    let createdAt = CREATED_AT_GTE

    if (storedCollections.length > 0) {
      // Doing + 1 at the end so it doesn't have the same value and the same proxy is attempted to be verified again.
      const latestCollectionCreatedAt = Number(storedCollections[storedCollections.length - 1].createdAt) + 1

      if (Number(createdAt) < latestCollectionCreatedAt) {
        createdAt = latestCollectionCreatedAt.toString()
      }
    }

    collections = await getCollectionsCreatedWithFactoryV3(createdAt)
  }

  for (let i = 0; i < collections.length; i++) {
    console.log(`${i + 1} / ${collections.length}`)

    const collection = collections[i]

    try {
      await verifyProxyExpectedImplementation(collection.id)

      console.log("Verified successfully (Or already verified)")

      if (onlyFailed) {
        delete (collection as StoredCollection).failedWith
      } else {
        storedCollections.push({ ...collection })
      }
    } catch (e: any) {
      console.error(e.message)

      if (onlyFailed) {
        (collection as StoredCollection).failedWith = e.message
      } else {
        storedCollections.push({ ...collection, failedWith: e.message })
      }
    }

    fs.writeFileSync(dataPath, JSON.stringify(storedCollections, null, 2))
  }
}

async function getCollectionsCreatedWithFactoryV3(createdAt: string): Promise<Collection[]> {
  const query = `
      {
        collections(where:{ createdAt_gte: "${createdAt}" }, orderBy: createdAt, orderDirection: asc, first: 1000) {
          id
          createdAt
        }
      }
      `

  console.log("Fetching collections created with factory v3")

  const response = await fetch(SUBGRAPH_URL, {
    method: "post",
    body: JSON.stringify({ query }),
  })

  const {
    data: { collections },
  } = await response.json()

  console.log(`Collections obtained: ${collections.length}`)

  if (collections.length >= 1000) {
    console.warn(`There might be more collections`)
  }

  return collections.map((c: any) => ({ id: c.id, createdAt: c.createdAt }))
}

async function verifyProxyExpectedImplementation(proxyAddress: string) {
  try {
    console.log(`Verifying proxy implementation for ${proxyAddress}`)

    const form = new FormData()
    form.append("address", proxyAddress)
    form.append("expectedimplementation", COLLECTION_IMPLEMENTATION_ADDRESS)

    const response = await fetch(
      `https://api.polygonscan.com/api?module=contract&action=verifyproxycontract&apikey=${POLYGONSCAN_API_KEY}`,
      {
        method: "post",
        body: form,
      }
    )

    if (!response.ok) {
      throw new Error(`Response was not ok - ${await response.text()}`)
    }

    const { status, result } = await response.json()

    if (status !== "1") {
      throw new Error(`Status not 1 - ${result}`)
    }
  } catch (e: any) {
    throw new Error(`Verify failed with message: ${e.message}`)
  }
}
