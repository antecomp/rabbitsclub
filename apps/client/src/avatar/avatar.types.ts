import { SuggestedString } from "../types/misc.types";
import { EyeVariant } from "./assets";

export type HeadVariant = number;

export interface AvatarData {
    head: HeadVariant;
    leftEye: SuggestedString<EyeVariant>;
    rightEye: SuggestedString<EyeVariant>;
    leftEyeOffset: { x: number; y: number };
    rightEyeOffset: { x: number; y: number };
}