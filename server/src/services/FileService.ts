import csv from 'csvtojson';

export interface Row {
    [key: string]: string;
}

export default class FileService {
  static async readCsvFile(filePath: string): Promise<Row[]> {
    const data: Row[] = await csv({
        delimiter: [';']
    }).fromFile(filePath);
    return data;
  }
}
