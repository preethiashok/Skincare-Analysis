import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, RoutineResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateSkincareRoutine = async (profile: UserProfile): Promise<RoutineResponse> => {
  const modelId = "gemini-2.5-flash";

  const prompt = `
    Act as an expert dermatologist and skincare formulator with a touch of fun, friendly advice.
    Create a personalized skincare routine for a user with the following profile:
    - Name: ${profile.name}
    - Skin Type: ${profile.skinType}
    - Skin Concerns: ${profile.concerns.join(", ")}
    - Sensitive Skin: ${profile.sensitivity ? "Yes" : "No"}

    Please provide:
    1. A brief, encouraging analysis of their skin profile.
    2. A Morning Routine.
    3. An Evening Routine.
    4. 3-5 Dietary/Lifestyle tips beneficial for their specific skin condition.
    5. A list of ingredients they should specifically avoid.

    For each step in the routine:
    - Specify Product Type and Key Ingredients.
    - Explain ingredient benefits.
    - Suggest specific affordable market products (e.g., CeraVe, The Ordinary, Vanicream, etc.).
    - **CRITICAL**: For each market recommendation, provide 1-2 "substitutes" or alternative products that are similar in formulation and price point, in case the user cannot find the primary recommendation.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            analysis: { type: Type.STRING, description: "Professional analysis of the user's skin profile" },
            morningRoutine: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  stepName: { type: Type.STRING, description: "e.g., Cleanser" },
                  productType: { type: Type.STRING, description: "Generic product description, e.g., Gel Cleanser" },
                  keyIngredients: { type: Type.ARRAY, items: { type: Type.STRING } },
                  ingredientBenefits: { type: Type.STRING, description: "Brief explanation of what the key ingredients do for the skin" },
                  reason: { type: Type.STRING, description: "Why this product helps this specific user" },
                  usageTips: { type: Type.STRING, description: "How to apply" },
                  marketRecommendations: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING, description: "Product Name" },
                        brand: { type: Type.STRING, description: "Brand Name" },
                        approxPrice: { type: Type.STRING, description: "Approximate price e.g. '$10-$15'" },
                        substitutes: { 
                          type: Type.ARRAY, 
                          items: { type: Type.STRING },
                          description: "List of 1-2 specific alternative product names/brands similar to the main recommendation"
                        }
                      }
                    }
                  }
                }
              }
            },
            eveningRoutine: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  stepName: { type: Type.STRING },
                  productType: { type: Type.STRING },
                  keyIngredients: { type: Type.ARRAY, items: { type: Type.STRING } },
                  ingredientBenefits: { type: Type.STRING },
                  reason: { type: Type.STRING },
                  usageTips: { type: Type.STRING },
                  marketRecommendations: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        brand: { type: Type.STRING },
                        approxPrice: { type: Type.STRING },
                        substitutes: { type: Type.ARRAY, items: { type: Type.STRING } }
                      }
                    }
                  }
                }
              }
            },
            dietaryTips: { type: Type.ARRAY, items: { type: Type.STRING } },
            avoidIngredients: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });

    if (!response.text) {
      throw new Error("No response from AI");
    }

    const data = JSON.parse(response.text) as RoutineResponse;
    return data;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};