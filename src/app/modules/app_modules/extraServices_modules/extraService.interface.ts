import { EXTRA_SERVICE_STATUS } from "../../../../enums/extraService";

export interface IExtraService  {
  name: string;
  description: string;
  image: string;
  cost: number;
  isProtection?: boolean;
  status: EXTRA_SERVICE_STATUS;
}