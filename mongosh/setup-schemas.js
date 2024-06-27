use("chorder")

db.runCommand({
  collMod: "songs",
  validator: {
    $jsonSchema: {
      bsonType: "object",
      title: "Song Object Validation",
      required: [ "_id", "title", "slug", "lyrics", "arrangements", "isDeleted" ],
      additionalProperties: false,
      properties: {
        "_id": { "bsonType": "objectId" },
        title: {
          bsonType: "string",
          description: "'title' must be a string and is required"
        },
        slug: {
          bsonType: "string",
          description: "'slug' must be a string and is required",
        },
        artist: {
          bsonType: "string",
          description: "'artist' must be a string"
        },
        lyrics: {
          bsonType: "string",
          description: "'lyrics' must be a string and is required"
        },
        isDeleted: {
          bsonType: "bool",
          description: "'isDeleted' must be a boolean and is required"
        },
        arrangements: {
          bsonType: "array",
          description: "'arrangements' must be an array and is required",
          minItems: 1, // each song must have at least one arrangement
          items: {
            "bsonType": "object",
            "additionalProperties": false,
            "required": [ "key", "units", "songMap", "isDefault", "isDeleted", "lastUnitId"],
            "properties": {
              "key": {
                "bsonType": "string",
                "description": "'key' must be a string and is required"
              },
              "units": {
                "bsonType": "array",
                "description": "'units' must be an array and is required",
                "minItems": 1,
                "items": {
                  "bsonType": "object",
                  "additionalProperties": false,
                  "required": ["content", "type", "internalId"],
                  "properties": {
                    "content": {
                      "bsonType": "string",
                      "description": "'content' must be a string and is required"
                    },
                    "type": {
                      "bsonType": "string",
                      "description": "'type' must be a string and is required"
                    },
                    "internalId": {
                      "bsonType": "int",
                      "description": "'internalId' must be an integer and is required"
                    }
                  }
                }
              },
              "songMap": {
                "bsonType": "array",
                "description": "'songMap' must be an array and is required",
                "minItems": 1,
                "items": {
                  "bsonType": "int",
                  "description": "'songMap' must be an array of integers"
                }
              },
              "isDefault": {
                "bsonType": "bool",
                "description": "'isDefault' must be a boolean and is required"
              },
              "isDeleted": {
                "bsonType": "bool",
                "description": "'isDeleted' must be a boolean and is required"
              },
              "lastUnitId": {
                "bsonType": "int",
                "description": "'lastUnitId' must be an integer and is required"
              }
            }
          }
        }
      }
    }
  },
  validationLevel: "strict"
})
db.songs.createIndex( { "slug": 1 }, { unique: true } )

db.runCommand({
  collMod: "slugs",
  validator: {
    $jsonSchema: {
      bsonType: "object",
      title: "Slug Object Validation",
      required: [ "_id", "slug" ],
      additionalProperties: false,
      properties: {
        "_id": { "bsonType": "objectId" },
        slug: {
          bsonType: "string",
          description: "'slug' must be a string and is required"
        }
      }
    }
  },
  validationLevel: "strict"
})
db.slugs.createIndex( { "slug": 1 }, { unique: true } )
