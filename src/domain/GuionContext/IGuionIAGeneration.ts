import { Guion } from "./Guion";

export interface IGuionAIGeneration {
  generateGuionContent(promp: string): Promise<string>
}
