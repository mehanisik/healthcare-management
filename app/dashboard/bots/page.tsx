import { getBotsFn } from '#/actions/get-bots';
import { DashboardBots } from '#/components/features/dashboard/bots';

export default async function BotsPage() {
  const bots = await getBotsFn();
  return <DashboardBots bots={bots} />;
}
