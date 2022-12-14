import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import { promises as fs }  from 'fs';
import path from 'path';

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export const generate = async (locales: string[], basePath: string, logger: any) => {
  const randomStr = `#${uuidv4()}#`;
  const randomStrRegex = new RegExp(randomStr, "g");

  const attributeNamePrefix = "@_";
  const options = {
    ignoreAttributes: false,
    attributeNamePrefix,
    format: true
  };

  const builder = new XMLBuilder(options);
  // with stopNodes option, the source tag's value would not be parsed
  // so value like <source>Hi, <x id="INTERPOLATION" equiv-text="{{ name }}"/>! LL</source> would be kept in the ouput
  // tagValueProcessor replace all & by a random string which will be replaced back to & at the end of the workflow
  const parser = new XMLParser({
    ...options,
    stopNodes: ["xliff.file.body.trans-unit.source", "xliff.file.body.trans-unit.target"],
    tagValueProcessor: (tagName: string, tagValue: string, jPath: string, hasAttributes: boolean, isLeafNode: boolean) => {
      if (tagName === 'source' || tagName === 'target') {
        return tagValue.replace(/&/g, randomStr);
      }

      return tagValue;
  }});

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


    const translatedXlf = builder.build(translatedObject)
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(randomStrRegex, '&');

    await fs.writeFile(path.join(basePath, `messages.${locale}.xlf`), translatedXlf);
    logger.log({ level: 'info', message: `Done messages.${locale}.xlf`});
  }
}

