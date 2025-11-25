import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, RoutineResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateSkincareRoutine = async (profile: UserProfile): Promise<RoutineResponse> => {
  const modelId = "gemini-2.5-flash";

  const prompt = `
    Act as an expert dermatologist and skincare formulator.
    Create a personalized skincare routine for a user with the following profile:
    - Name: ${profile.name}
    - Skin Type: ${profile.skinType}
    - Skin Concerns: ${profile.concerns.join(", ")}
    - Sensitive Skin: ${profile.sensitivity ? "Yes" : "No"}

    Please provide:
    1. A brief analysis of their skin profile.
    2. A Morning Routine (Steps, Product Types, Key Ingredients, benefits of ingredients, Reason, specific affordable market products).
    3. An Evening Routine (Steps, Product Types, Key Ingredients, benefits of ingredients, Reason, specific affordable market products).
    4. 3-5 Dietary/Lifestyle tips beneficial for their specific skin condition.
    5. A list of ingredients they should specifically avoid.

    Be specific about ingredient concentrations where relevant (e.g., "2% Salicylic Acid").
    Focus on evidence-based ingredients.
    For market products, suggest widely available, affordable options (e.g. CeraVe, The Ordinary, Vanicream, etc.).
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
                        approxPrice: { type: Type.STRING, description: "Approximate price e.g. '$10-$15'" }
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
                        approxPrice: { type: Type.STRING }
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