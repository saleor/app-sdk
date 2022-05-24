import path from 'path';
import fg from 'fast-glob';
import { print } from "graphql/language/printer";

export const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);
export const dropFileExtension = (filename: string) => path.parse(filename).name;

export const inferWebhooks = async (baseURL: string, generatedGraphQL: object) => {
  const entries = await fg(['*.ts'], { cwd: 'pages/api/webhooks' });

  return entries.map(dropFileExtension).map((name: string) => {
    const camelcaseName = name.split('-').map(capitalize).join('');
    const statement = `${camelcaseName}SubscriptionDocument`;
    const query = statement in  generatedGraphQL ? print((generatedGraphQL as any)[statement]) : null;

    return {
      name,
      asyncEvents: [name.toUpperCase().replace("-", "_")],
      query, 
      targetUrl: `${baseURL}/api/webhooks/${name}`,
    };
  });
};