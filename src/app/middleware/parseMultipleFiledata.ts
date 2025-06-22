import { Request, Response, NextFunction } from 'express';
import { getMultipleFilesPath, IFolderName } from '../../shared/getFilePath';

const parseMultipleFilesData = (fieldName: IFolderName) =>  (req: Request, res: Response, next: NextFunction) => {
     try {
          const image = getMultipleFilesPath(req.files, fieldName);
          if (req.body.data) {
               const data = JSON.parse(req.body.data);
               req.body = { [fieldName]: image, ...data };
          } else {
               req.body = { [fieldName]: image };
          }
          next();
     } catch (error) {
          next(error);
     }
};

export default parseMultipleFilesData;
