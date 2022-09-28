import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import { promises as fs }  from 'fs';
import path from 'path';

export const generate = async (locales: string[], basePath: string, logger: any) => {
  const attributeNamePrefix = "@_";
  const options = {
    ignoreAttributes: false,
    attributeNamePrefix,
    format: true
  };
  const builder = new XMLBuilder(options);
  const parser = new XMLParser(options);

  const sourceXlf = await fs.readFile(path.join(basePath, 'messages.xlf'), { encoding: 'utf8' });
  const sourceObjecct = parser.parse(sourceXlf);
  const transUnits = sourceObjecct.xliff.file.body['trans-unit'];

  for(let locale of locales) {
    let targetXlf = '';
    let targetTransUnits = [];
    try {
      targetXlf = await fs.readFile(path.join(basePath, `messages.${locale}.xlf`), { encoding: 'utf8' });
      const targetObject = parser.parse(targetXlf);
      targetTransUnits = targetObject.xliff.file.body['trans-unit'];
    } catch (error) {
      targetTransUnits = [];
    }

    const translatedUnits = transUnits.map((transUnit) => {
      const targetTransUnit = targetTransUnits.find(x => x[`${attributeNamePrefix}id`] === transUnit[`${attributeNamePrefix}id`]);
      if (targetTransUnit) {
        transUnit[`target`] = targetTransUnit['target'];
      } else {
        transUnit[`target`] = '';
      }

      return transUnit;
    })

    const translatedObject = { ...sourceObjecct };
    translatedObject.xliff.file[`${attributeNamePrefix}source-language`] = locale;
    translatedObject.xliff.file.body['trans-unit'] = translatedUnits;
    const translatedXlf = builder.build(translatedObject);

    await fs.writeFile(path.join(basePath, `messages.${locale}.xlf`), translatedXlf);
    logger.log({ level: 'info', message: `Done messages.${locale}.xlf`});
  }
}

