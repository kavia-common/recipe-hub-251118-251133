import RecipeHubApp from '@/components/recipe-hub-app';
import { getApiBaseUrl, getAppData } from '@/lib/api';

/**
 * Server-rendered Recipe Hub page entrypoint.
 *
 * @return {Promise<JSX.Element>} The complete Recipe Hub frontend.
 */
export default async function Home() {
    const appData = await getAppData();

    return <RecipeHubApp appData={appData} apiBaseUrl={getApiBaseUrl()} />;
}
