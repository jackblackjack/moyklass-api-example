module.exports = {
    default: {
        name: 'app-graph-rest-storage',
        version: '0.0.1'
    },
    // Validation schema 
    // for check data into "add" method.
    update: {
        "type": "object",
        "required": ["content"],
        "properties": {
            "content": {
                "type": "object"
            },
            "attributes": {
                "type": "object"
            },
            "relation": {
                "type": "object",
                "properties": {
                    "insert": { "type": "object" },
                    "update": { "type": "object" },
                    "delete": { "type": "object" }
                }
            }
        }
    },
    // Validation schema 
    // for check data into "add" method.
    insert: {
        "type": "object",
        "required": ["content"],
        "properties": {
            "content": {
                "type": "object"
            },
            "attributes": {
                "type": "object"
            },
            "relation": {
                "type": "object",
                "properties": {
                    "from": { "type": "array" },
                    "to": { "type": "string" },
                    "content": { "type": "object" }
                }
            }
        }
    }
}
