import { AU_STATES } from "../constants/constants";

export const getStateAbbreviation = (fullStateName: string): string | undefined => {
  return Object.entries(AU_STATES).find(([, fullName]) => fullName === fullStateName)?.[0];
};
