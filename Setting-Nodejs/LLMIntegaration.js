import OpenAI from "openai";
// import ClickUpTask from "./ClickUpIntegration.js";
const client = new OpenAI({
  apiKey:
    "your_openai_api_key", // Replace with your OpenAI key
});
// const taskDescription = ClickUpTask;

// const response = await client.responses.create({
//   model: "gpt-5-nano",   
//   input: promptContent,
// });

export async function generateSchema(taskDescription) {
  const prompt = generatePrompt(taskDescription);
  const response = await client.responses.create({
    model: "gpt-5-nano",
    input: prompt,
  });
  return response.output_text;
}

function generatePrompt(taskDescription) {
  const promptContent = `# You are a senior software architect and JSON schema generator.
                            Your ONLY task is to convert the user's task or feature description into a JSON object that STRICTLY follows the schema below.
                            # OUTPUT RULES (MANDATORY)

                            Output ONLY valid JSON.
                            Do NOT add explanations, comments, markdown, or text outside JSON.
                            Do NOT rename keys.
                            Do NOT set any special Characters or numbers in the keys.
                            DO NOT set any special Characters or numbers in the values.
                            DO NOT USE ANY SECIAL CHARACTERS FOR ANY KEY AND VALUE FOR ANY MODULE.
                            Do NOT invent fields or relationships not explicitly mentioned.
                            If something is unclear, make the most reasonable assumption based on common simple CRUD systems.
                            Field types must be one of:
                               - string
                               - textarea
                               - integer
                               - decimal
                               - boolean
                               - date
                               - datetime
                               - enum
                            showInTable must always be true or false.
                            Relationship types must be one of:
                               - belongsTo
                               - hasMany
                               - belongsToMany
                               - hasOne
                            Method names must be camelCase.
                            Foreign keys must be snake_case.
                            Always return arrays even if they contain a single item.
                            =====================
                            NATURAL LANGUAGE INTERPRETATION RULES
                            =====================


                            The task description may be written in non-technical language.
                            Infer relationships from meaning, not keywords.
                            Interpretation examples:
                            "Each item has one category" → belongsTo
                            "A category contains many items" → hasMany
                            "Items can have multiple labels" → belongsToMany
                            "A profile is linked to one user" → hasOne
                            "A user can have many orders" → hasMany
                            Words like:
                              "has", "contains", "includes", "linked to", "assigned to", "grouped under"
                              imply relationships.
                            If no relationship can be reasonably inferred, do NOT create one.
                            Prefer the most common real-world business relationship.
                            =====================
                            BASE JSON STRUCTURE (DO NOT CHANGE)
                            =====================
                            {
                              "modules": [
                                {
                                  "name": "",
                                  "fields": [],
                                  "relationships": []
                                }
                              ]
                            }
                            =====================
                            FIELD OBJECT STRUCTURE
                            =====================
                            {
                              "name": "",
                              "type": "",
                              "description": "",
                              "showInTable": true
                            }
                            =====================
                            RELATIONSHIP STRUCTURE
                            =====================
                            {
                              "type": "",
                              "relatedModel": "",
                              "methodName": "",
                              "foreignKey": "",
                              "inverseMethod": "",
                              "inverseType": ""
                            }
                            For belongsToMany ONLY, use this structure:
                            {
                              "type": "belongsToMany",
                              "relatedModel": "",
                              "methodName": "",
                              "foreignKey": "",
                              "localKey": {
                                "inverseField": ""
                              },
                              "inverseMethod": "",
                              "inverseType": "belongsToMany"
                            }
                            =====================
                            IMPORTANT
                            =====================
                            Assume this JSON will be used for automatic simple CRUD generation.
                            Do NOT add authentication, permissions, soft deletes, or advanced logic unless explicitly mentioned.
                            =====================
                            TASK DESCRIPTION (SOURCE OF TRUTH)
                            =====================
                            ${taskDescription}
                            `;
  return promptContent;
}
// console.log(response.output_text);
